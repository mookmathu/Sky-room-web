const BASE_URL = "http://localhost:4000";
const USER_ID = localStorage.getItem('USER_ID'); // ดึง user_id จาก localStorage
const USERNAME = localStorage.getItem('USERNAME'); // ดึง username จาก localStorage
let room = "";

window.onload = async () => {
    document.getElementById("username-login").innerText = USERNAME; // แสดงชื่อผู้ใช้งาน
}

const reserve_room = async (room_name) => {
    // console.log(room_name);
    // console.log("USER_ID:", USER_ID);
    room = room_name;
    // แสดงข้อความ ใน modal
    document.getElementById("modalLabel").innerText = "จองห้องประชุม " + room_name;
    document.querySelector(".modal-body p").innerText = "คุณต้องการจองห้องประชุม " + room_name + " ใช่หรือไม่?";

    // การหาค่าวันนี้และวันพรุ่งนี้
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // ตั้งค่าให้เป็นโซนเวลาไทย (UTC+7)
    function formatDateToThai(date) {
        let tzOffset = 7 * 60 * 60 * 1000; // Offset +7 ชั่วโมง
        let localDate = new Date(date.getTime() + tzOffset);
        return localDate.toISOString().split('T')[0]; // แปลงเป็น "YYYY-MM-DD"
    }

    // แปลงวันที่เป็น String 
    let str_today = formatDateToThai(today);
    let str_tomorrow = formatDateToThai(tomorrow);

    const response = await axios.get(`${BASE_URL}/time`);
    // console.log("Response:", response.data);

    let inputDOM = document.getElementById("input");

    // จะเขียนโค้ด html ลงใน inputDOM
    let html_content = "";

    if (response.data.length > 0) {
        html_content += `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="">วันที่ (เดือน/วัน/ปี)</label>
                            <input class="form-control" type="date" name="reserve_date" min="${str_today}" max="${str_tomorrow}" value="${str_today}">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="start_time">ตั้งแต่</label>
                            <select class="form-control" name="start_time" id="start_time">
                                <option value="" selected disabled>-- กรุณาเลือกเวลา --</option>`;

        for (let i = 0; i < response.data.length; i++) {
            // วนลูปเพื่อเอาค่าเวลาจาก table time ออกมาใส่ใน option
            let id = response.data[i].id;
            let time = response.data[i].time;
            // console.log("Time:", time);

            html_content += `<option value="${time}" id="${id}">${time}</option>`;
        }

        html_content += `</select >
                            </select >
                        </div >
                    </div >

    <div class="form-row">
        <div class="form-group col-md-12">
            <label for="end_time">จนถึง</label>
            <select class="form-control" name="end_time" id="end_time">
                <option value="" selected disabled>-- กรุณาเลือกเวลา --</option>`;

        for (let i = 0; i < response.data.length; i++) {
            let id = response.data[i].id;
            let time = response.data[i].time;
            html_content += `<option value="${time}" id="${id}">${time}</option>`;
        }
        html_content += `</select>
        </div>
    </div>`;
    }

    // เอาค่า html_content ที่ได้ไปใส่ใน inputDOM
    inputDOM.innerHTML = html_content;
}

const submit_reserve = async () => {

    try {
        let dateDOM = document.querySelector('input[name=reserve_date]');
        let start_timeDOM = document.querySelector('select[name=start_time]');
        let end_timeDOM = document.querySelector('select[name=end_time]');

        // เอาค่า time ที่ถูกเลือกใน select มาเก็บในตัวแปร
        let time1DOM = document.querySelector('select[name=start_time] option:checked');
        let time2DOM = document.querySelector('select[name=end_time] option:checked');

        let time1_id = time1DOM.id; // id ของเวลาเริ่มต้น
        let time2_id = time2DOM.id; // id ของเวลาสิ้นสุด

        // console.log(dateDOM.value);
        // console.log(start_timeDOM.value);
        // console.log(end_timeDOM.value);

        // console.log("time1_id:", time1_id); // ตรวจสอบ id ของเวลาเริ่มต้น
        // console.log("time2_id:", time2_id); // ตรวจสอบ id ของเวลาสิ้นสุด

        let reserveData = {};
        let insertData = {};

        if (end_timeDOM.value > start_timeDOM.value) {
            reserveData = {
                user_id: USER_ID,
                room_name: room,
                date: dateDOM.value,
                // start_time: start_timeDOM.value,
                // end_time: end_timeDOM.value,
                time1_id: parseInt(time1_id), // id ของเวลาเริ่มต้น
                time2_id: parseInt(time2_id) // id ของเวลาสิ้นสุด
            }

            insertData = {
                user_id: USER_ID,
                room_name: room,
                date: dateDOM.value,
                start_time: start_timeDOM.value,
                end_time: end_timeDOM.value,
            }
        } else {
            alert('กรุณาเลือกเวลาให้ถูกต้อง!');
            return;
        }

        // console.log("Reserve Data:", reserveData); // ตรวจสอบข้อมูลที่ส่งไป

        const chk_data = await axios.post(`${BASE_URL}/reservations`, reserveData);
        // console.log("Response 1:", chk_data.data);
        // console.log("chk_data:", chk_data.data.length); // ตรวจสอบข้อมูลที่ส่งไป

        // ถ้า มากกว่า 0 แสดงว่ามีการจองห้องประชุมแล้ว
        if (chk_data.data.length > 0) {
            alert('ไม่สามารถจองห้องประชุมได้!');
            return;
        } else if (chk_data.data.length === 0) {
            const res = await axios.post(`${BASE_URL}/reservations/create`, insertData);
            // console.log("Response 2:", res.data);

            if (res.data.status === "success") {
                alert('จองห้องประชุมสำเร็จ!');
                window.location.href = "reservation_history.html"; // เปลี่ยนเป็นหน้า URL ที่ต้องการ redirect ไป
            }
        }

    } catch (error) {
        console.log('Error:', error); // ตรวจสอบข้อผิดพลาดที่เกิดขึ้น
        // let messageDOM = document.getElementById('message');
        if (error.response) {
            console.log('Error Response:', error.response); // ตรวจสอบข้อความที่ได้รับจาก API
        } else {
            console.log('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
        }
    }
}