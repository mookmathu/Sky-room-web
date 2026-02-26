document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = "http://localhost:4000"; // URL ของ API
    const USERNAME = localStorage.getItem('USERNAME'); // ดึง username จาก localStorage
    let mode = "CREATE"; // โหมดการทำงาน (create, update, delete)

    document.getElementById("username-login").innerText = USERNAME;

    const validateData = (userData) => {
        let errors = [];
        if (!userData.name) {
            errors.push('กรุณากรอกชื่อ');
        }
        if (!userData.email) {
            errors.push('กรุณากรอกอีเมล');
        }
        if (!userData.tel) {
            errors.push('กรุณากรอกเบอร์โทรศัพท์');
        }
        if (!userData.description) {
            errors.push('กรุณากรอกรายละเอียด');
        }
        return errors;
    };

    // ฟังก์ชันสำหรับการส่งข้อมูล
    const submitData = async (event) => {
        // console.log("Contact Form Loaded");
        let nameDOM = document.querySelector('input[name=name]');
        let emailDOM = document.querySelector('input[name=email]');
        let telDOM = document.querySelector('input[name=subject]');
        let descriptionDOM = document.querySelector('textarea[name=message]');
        let messageDOM = document.getElementById('message');

        console.log(nameDOM.value);
        console.log(emailDOM.value);
        console.log(telDOM.value);
        console.log(descriptionDOM.value);

        try {
            // รับข้อมูลจากฟอร์ม
            let userData = {
                name: nameDOM.value,
                email: emailDOM.value,
                tel: telDOM.value,
                description: descriptionDOM.value
            };

            console.log("submitData", userData);
            
            let message = 'บันทึกข้อมูลเรียบร้อย';
            if (mode === 'CREATE') {
                const response = await axios.post(`${BASE_URL}/contact`, userData);
                console.log('Response:', response.data);
                document.getElementById('message_success').style.display = 'block';
                document.getElementById('p_message_success').innerText = message;
                setTimeout(() => {
                    window.location.reload(); // เปลี่ยนเป็นหน้า URL ที่ต้องการ redirect ไป
                }, 1000); // 1 วินาที
                // window.location.reload(); // โหลดหน้าใหม่หลังจากบันทึกข้อมูล
            }
            // ตรวจสอบข้อผิดพลาดก่อนส่ง
            const errors = validateData(userData);
            if (errors.length > 0) {
                throw {
                    message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                    errors: errors
                };
            }

            // แสดงข้อความหลังการส่งข้อมูล
            messageDOM.innerText = message;
            messageDOM.className = 'message success';

        } catch (error) {
            console.log('error message', error.message);
            console.log('error', error.errors);

            if (error.response) {
                console.log('error.response', error.response.data.message);
                error.message = error.response.data.message;
                error.errors = error.response.data.errors;
            }

            // จัดการข้อผิดพลาด
            // let htmlData = '<div>';
            // htmlData += `<div> ${error.message} </div>`;
            // htmlData += '<ul>';

            // if (error.errors) {
            //     for (let i = 0; i < error.errors.length; i++) {
            //         htmlData += `<li> ${error.errors[i]} </li>`;
            //     }
            // }

            // htmlData += '</ul>';
            // htmlData += '</div>';

            // messageDOM.innerHTML = htmlData;
            // messageDOM.className = 'message danger';
        }
    };

    document.querySelector('form[name=contact-form]').addEventListener('submit', (event) => {
        event.preventDefault(); // ป้องกันการส่งฟอร์มแบบปกติ
        submitData(event); // เรียกใช้ฟังก์ชันส่งข้อมูล
    });

});


