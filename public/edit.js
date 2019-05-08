const $ = require('jquery');
// const fs = require('fs');
// let file = "coursetrain";
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const { BrowserWindow } = remote;

let ctx = {
    courseId: null,
}

remote.getCurrentWindow().openDevTools();

ipc.send('edit-window-shown');



async function deleteHandler(e, id, questionRow) {
    e.preventDefault();
    let cf = confirm('Are you sure to delete this one???');
    if (cf) {
        console.log(id);
        await UserModel.deleteQuestion(id);
        questionRow.parentElement.removeChild(questionRow);
    }
}

ipc.on('edit-course-id', async(e, courseId) => {
    const course = await UserModel.getCourse(courseId);
    console.log(course);
    const questions = await UserModel.getQuiz(courseId);
    console.log(questions);
    //document.querySelector('#idEdit').value = course.id;
    document.querySelector('#nameEdit').value = course.name;
    document.querySelector('#descriptEdit').value = course.descript;
    ctx.courseId = course.id;


    const tbody = document.querySelector('.editTbody');
    for (const question of questions) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${question.id}</td>
        <td>${question.content}</td>
        <td>
            <div>
                <button class="deleteBtn1" id="delete">Delete</button>
            </div>
        </td>
    `;
        tr.querySelector('.deleteBtn1').addEventListener('click', (e) => deleteHandler(e, question.id, tr));
        tbody.appendChild(tr);
        console.log(question.id + question.content);

    }
});

$('#edit').click(async function(e) {
    e.preventDefault();
    let courseName = $('#nameEdit').val();
    let description = $('#descriptEdit').val();
    await UserModel.editCourse(ctx.courseId, courseName, description);
    ipc.send('course-edit', {
        id: ctx.courseId,
        name: courseName,
        descript: description,
    });
    alert('Course Edited...!');
    remote.getCurrentWindow().close();
});