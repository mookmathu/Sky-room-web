const express = require('express');
const bodyParset = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

const port = 4000;

app.use(bodyParset.json());
app.use(cors());

let users = []
let contact = []

let conn = null
const initMySQL = async () => {
    conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'webdb',
        port: 9906
    })
}

// ตรวจสอบการเข้าสู่ระบบ
app.post('/users', async (req, res) => {
    const arr_login = req.body;// ตรวจสอบข้อมูลที่ส่งไป
    // หาข้อมูลใน table users โดยใช้ username และ password ที่ส่งมา
    const results = await conn.query('SELECT * FROM users WHERE username = ? AND password = ?', [arr_login.username, arr_login.password]);
    res.json(results[0]);
});

// บันทึกข้อมูลผู้ติดต่อ
app.post('/contact', async (req, res) => {
    try {
        // ดึงข้อมูลจาก request body
        const contact = req.body;

        // ตรวจสอบข้อมูลว่ามีค่าว่างถูกส่งมาหรือเปล่า ถ้ามี ให้ส่ง status 400 กลับไป
        if (!contact.name || !contact.email || !contact.tel || !contact.description) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        // การเพิ่มข้อมูลลงในฐานข้อมูล
        const results = await conn.query('INSERT INTO contact SET ?', contact);

        // ส่งข้อมูลกลับไป
        res.json({
            message: 'Create contact successfully',
            data: results[0] // หรือ results[0] ขึ้นอยู่กับผลลัพธ์ที่ได้จากฐานข้อมูล
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            error: error.message
        });
    }
});

// ดึงข้อมูลเวลา
app.get('/time', async (req, res) => {
    const results = await conn.query('SELECT * FROM time');
    res.json(results[0]);
});

// Check reservations data
app.post('/reservations', async (req, res) => {
    const arr_data = req.body;// ตรวจสอบข้อมูลที่ส่งไป
    // const results = await conn.query('SELECT * FROM reservations WHERE room_name = ? AND date = ? AND start_time = ? AND end_time = ?', [arr_data.room_name, arr_data.date, arr_data.start_time, arr_data.end_time]);
    const results = await conn.query(
        `SELECT *
        FROM reservations AS r
        JOIN time AS t1 ON t1.time = r.start_time
        JOIN time AS t2 ON t2.time = r.end_time
        WHERE r.room_name = ?
        AND r.date = ?
        AND (
            (? >= t1.id AND ? < t2.id) OR  -- ตรวจสอบว่า start_time อยู่ในช่วงจอง
            (? > t1.id AND ? <= t2.id) OR  -- ตรวจสอบว่า end_time อยู่ในช่วงจอง
            (? <= t1.id AND ? >= t2.id)    -- ตรวจสอบว่าครอบคลุมทั้งหมด
        )`,
        [
            arr_data.room_name,
            arr_data.date,
            arr_data.time1_id, arr_data.time1_id,
            arr_data.time2_id, arr_data.time2_id,
            arr_data.time1_id, arr_data.time2_id
        ]
    );
    res.json(results[0]);
});

// การจองห้องประชุม
app.post('/reservations/create', async (req, res) => {
    try {
        // ดึงข้อมูลจาก request body
        const data = req.body;

        // ตรวจสอบข้อมูลที่ได้จาก body ก่อนว่าเป็นข้อมูลที่ถูกต้องหรือไม่
        if (data.start_time == 0 || data.end_time == 0) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        const results = await conn.query('INSERT INTO reservations SET ?', data);

        // ส่งคำตอบกลับไปยัง client
        res.json({
            message: 'Successfully reserved',
            data: results[0], // หรือ results[0] ขึ้นอยู่กับผลลัพธ์ที่ได้จากฐานข้อมูล
            status: "success"
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            error: error.message
        });
    }
});

// ดึงข้อมูลการจองห้องประชุม
app.post('/reservations/load', async (req, res) => {
    const data = req.body;// ตรวจสอบข้อมูลที่ส่งไป
    const results = await conn.query('SELECT * FROM reservations WHERE user_id = ?', [data.USER_ID]);
    res.json(results[0]);
});

// ลบการจองห้องประชุม
app.delete('/reservations/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const results = await conn.query('DELETE from reservations WHERE id = ?', parseInt(id)) // parseInt คือการแปลงค่า id จาก string เป็น number

        res.json({
            message: 'Delete user successfully',
            data: results[0]
        });
    } catch (error) {
        console.error('error: ', error.message)
        res.status(500).json({
            message: 'someting went wrong',
            errorMessage: error.message
        })
    }
});

// Count all users
app.get('/users/count', async (req, res) => {
    const results = await conn.query('SELECT user_id FROM users');
    res.json(results[0]);
});

// Count all reports
app.get('/reservations/count', async (req, res) => {
    const results = await conn.query('SELECT id FROM reservations');
    res.json(results[0]);
});

// Most popular room
app.get('/reservations/popular', async (req, res) => {
    try {
        const results = await conn.query(`
            SELECT room_name, COUNT(*) AS count
            FROM reservations
            GROUP BY room_name
            ORDER BY count DESC
            LIMIT 1;
        `);
        res.json(results[0]);
    } catch (error) {
        console.error('Error fetching popular room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, async (req, res) => {
    await initMySQL();
    console.log('Server is running on port' + port);
});