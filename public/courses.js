const UserModel = require('../models/users_model.js');
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');

let selectedId = -1;

async function goClick(e, courseId) {
    e.preventDefault();

    await UserModel.getCourse(courseId);

    ipc.send('course-selected', {
        id: courseId,
    });
}

(async() => {
    const courses = await UserModel.getCourses('kien.do');

    const tbody = document.querySelector('.tbody');

    for (const course of courses) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td><input type="radio" name="radio"/></td>
        <td>${course.name}</td>
        <td>${course.descript}</td>`;

        if (!course.valid) {
            tr.classList.add('disabled-course');
            tr.querySelector('td > input').disabled = true;
        }



        tbody.appendChild(tr);



        // tr.addEventListener('click', () => {
        //     selectedId = course.id;
        // });

    }
})();

// function goClick() {
//     const button = document.querySelector('.next');

//     if (selectedId === -1) {
//         alert('please select a course');
//     } else {
//         window.location = `./question.html?courseId=${selectedId}`;
//     }
// }