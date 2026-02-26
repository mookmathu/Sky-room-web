document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = "http://localhost:4000"; // URL ของ API
    const USER_ID = 0;
    const USERNAME = "Unknown"; // ตั้ง default ให้ username

    const validateLogin = (loginData) => {
        let errors = [];
        if (!loginData.username) {
            errors.push('กรุณากรอกชื่อผู้ใช้งาน');
        }
        if (!loginData.password) {
            errors.push('กรุณากรอกรหัสผ่าน');
        }
        return errors;
    }

    const submitLogin = async (event) => {
        event.preventDefault(); // ป้องกันการรีเฟรชหน้าจอเมื่อ submit form

        try {
            let usernameDOM = document.querySelector('input[name=username]');
            let passwordDOM = document.querySelector('input[name=password]');
            // let messageDOM = document.getElementById('message');

            let loginData = {
                username: usernameDOM.value,
                password: passwordDOM.value
            }

            const response = await axios.post(`${BASE_URL}/users`, loginData);
            // console.log("Response:", response.data);
            // console.log("user_id:", response.data[0].user_id); // ตรวจสอบ user_id ที่ได้รับจาก API

            // เช็คว่ามีค่า username และ password อยู่ในฐานข้อมูลไหม
            if (response.data.length > 0) {
                localStorage.setItem('USER_ID', response.data[0].user_id); // เก็บ user_id ลงใน localStorage
                localStorage.setItem('USERNAME', response.data[0].username); // เก็บ username ลงใน localStorage
            }

            // console.log('Login Data:', loginData); // ตรวจสอบข้อมูลที่ส่งไป

            // ตรวจสอบการกรอกข้อมูล
            const errors = validateLogin(loginData);
            if (errors.length > 0) {
                console.log('Validation Errors:', errors); // ตรวจสอบข้อผิดพลาดในการกรอกข้อมูล
                throw {
                    message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                    errors: errors
                }
            }

            // วนลูปตรวจสอบ username และ password ที่ตรงกัน
            // let userFound = false;
            // for (let i = 0; i < response.data.length; i++) {
            //     let _username = response.data[i].username;
            //     let _password = response.data[i].password;

            //     if (loginData.username === _username && loginData.password === _password) {
            //         userFound = true;
            //         break; // ถ้าพบข้อมูลตรงกันจะออกจากลูป
            //     }
            // }

            // ถ้าพบข้อมูลตรงกัน
            // if (userFound) {
            //     messageDOM.innerText = 'เข้าสู่ระบบสำเร็จ!';
            //     messageDOM.className = 'message success';
            //     window.location.href = "index.html"; // เปลี่ยนเป็นหน้า URL ที่ต้องการ redirect ไป
            // } else {
            //     messageDOM.innerText = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            //     messageDOM.className = 'message danger';
            //     document.querySelector('#incorrect-password').style.display = 'block'; // แสดงข้อความผิดพลาด
            // }

            if (response.status === 200) {
                if (response.data.length > 0) {
                    // messageDOM.innerText = 'เข้าสู่ระบบสำเร็จ!';
                    // messageDOM.className = 'message success';
                    window.location.href = "index.html";
                } else {
                    // messageDOM.innerText = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
                    // messageDOM.className = 'message danger';
                    document.querySelector('#incorrect-password').style.display = 'block';
                    return; // ออกจากฟังก์ชันถ้าไม่พบข้อมูลตรงกัน
                }
            }

        } catch (error) {
            console.log('Error:', error); // ตรวจสอบข้อผิดพลาดที่เกิดขึ้น
            let messageDOM = document.getElementById('message');
            if (error.response) {
                console.log('Error Response:', error.response); // ตรวจสอบข้อความที่ได้รับจาก API
                messageDOM.innerText = error.response.data.message;
                messageDOM.className = 'message danger';
            } else {
                messageDOM.innerText = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
                messageDOM.className = 'message danger';
            }
        }
    }

    document.getElementById('loginForm').addEventListener('submit', submitLogin);
});
