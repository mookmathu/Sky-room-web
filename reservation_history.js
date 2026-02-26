const BASE_URL = "http://localhost:4000";
const USER_ID = localStorage.getItem('USER_ID');
const USERNAME = localStorage.getItem('USERNAME'); // ดึง username จาก localStorage

// เรียกใช้ฟังก์ชันเมื่อโหลดหน้าเว็บ
window.onload = async () => {
    await loadDATA();
    await count_members();
    await count_reservations();
    await popular_room();
    document.getElementById("username-login").innerText = USERNAME;
}

const loadDATA = async () => {
    // console.log("Reservation page loaded");
    // 1. load user ทั้งหมดจาก api ที่เตรียมไว้
    let DATA = {
        USER_ID: USER_ID
    };

    const response = await axios.post(`${BASE_URL}/reservations/load`, DATA);
    // console.log("Response:", response.data);

    const reservationDOM = document.getElementById("reservation-table");
    // 2. นำ user ทั้งหมด โหลดกลับเข้าไปใน html
    let htmlDATA = '';
    htmlDATA += `
        <table class="table table-bordered table-striped roundedTable">
            <thead>
                <tr>
                    <th>#</th>
                    <th>ห้องประชุม</th>
                    <th>วันที่</th>
                    <th>ตั้งแต่</th>
                    <th>จนถึง</th>
                    <th>Action</th>
                <tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < response.data.length; i++) {
        let data = response.data[i];
        let data_date = new Date(data.date);
        let format_date = data_date.toLocaleDateString('en-GB'); // แปลงวันที่เป็นรูปแบบ dd/mm/yyyy
        htmlDATA += `
            <tr>
                <td>${i + 1}</td>
                <td>${data.room_name}</td>
                <td>${format_date}</td>
                <td>${data.start_time}</td>
                <td>${data.end_time}</td>
                <td><button class='delete btn-delete' data-id='${data.id}' id="btn-delete">DELETE</button></td>
            </tr>
        `;
    }
    htmlDATA += `
            </tbody>
        </table>
    `;

    reservationDOM.innerHTML = htmlDATA;

    // 3. ลบ ข้อมูลการจอง
    const deleteDOMs = document.getElementsByClassName('delete btn-delete');
    // console.log("deleteDOMs:", deleteDOMs); // ตรวจสอบ deleteDOMs
    for (let i = 0; i < deleteDOMs.length; i++) {
        deleteDOMs[i].addEventListener('click', async (event) => {
            event.preventDefault(); // ป้องกันการรีเฟรชหน้าจอเมื่อคลิกปุ่มลบ
            // ดึง id ของ ข้อมูลการจอง ที่ต้องการลบ
            const id = event.target.dataset.id;
            // console.log("ID:", id); // ตรวจสอบ id ที่ต้องการลบ
            try {
                // Corrected URL here
                // await axios.delete(`${BASE_URL}/reservations/delete/${id}`);
                const response = await axios.delete(`${BASE_URL}/reservations/delete/${id}`);
                // console.log("Response:", response.data); // ตรวจสอบการลบข้อมูล
                alert('ลบข้อมูลการจองเรียบร้อยแล้ว!');
                loadDATA(); // โหลดตารางใหม่หลังจากลบข้อมูล โดยไม่ต้องโหลดหน้าใหม่
                // window.location.reload(); // โหลดหน้าใหม่หลังจากลบข้อมูล
            } catch (error) {
                console.error('error', error);
            }
        });
    }
}

// ส่วน แดชบอร์ด
// จำนวนสมาชิกทั้งหมด
const count_members = async () => {
    const response = await axios.get(`${BASE_URL}/users/count`);
    // console.log("Response:", response.data);
    const membersDOM = document.getElementById("members");
    membersDOM.innerText = response.data.length; // จำนวนสมาชิกทั้งหมด
}

// จำนวนการจองทั้งหมด
const count_reservations = async () => {
    const response = await axios.get(`${BASE_URL}/reservations/count`);
    // console.log("Response:", response.data);
    const listDOM = document.getElementById("list");
    listDOM.innerText = response.data.length; // จำนวนสมาชิกทั้งหมด
}

// ห้องประชุมที่ถูกจองมากที่สุด
const popular_room = async () => {
    const response = await axios.get(`${BASE_URL}/reservations/popular`);
    // console.log("Response:", response.data);
    const popularDOM = document.getElementById("popular");
    popularDOM.innerText = response.data[0].room_name;
}