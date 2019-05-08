const $ = require('jquery');
const fs = require('fs');
const url = require('url');
const path = require('path');
let file = "coursetrain";
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const { BrowserWindow } = remote;


remote.getCurrentWindow().openDevTools();
let courses = [];
let ctx = {
    courseId: null,
}



async function deleteHandler(e, courseId, courseRow) {
    e.preventDefault();
    let cf = confirm('Are you sure to delete this one???');
    if (cf) {
        await UserModel.deleteCourse(courseId);
        courseRow.parentElement.removeChild(courseRow);
    }
}

async function deleteHandler1(e, questionId, questionRow) {
    e.preventDefault();
    let cf = confirm('Are you sure to delete this question???');
    if (cf) {
        await UserModel.deleteQuestion(questionId);
        questionRow.parentElement.removeChild(questionRow);
    }
}

async function deleteHandler2(e, answerId, answerRow) {
    e.preventDefault();
    let cf = confirm('Are you sure to delete this answer???');
    if (cf) {
        await UserModel.deleteAnswer(answerId);
        answerRow.parentElement.removeChild(answerRow);
    }
}

async function editHandler2(e, answerId) {
    e.preventDefault();

    //await UserModel.getAnswerById(answerId);

    ipc.send('edit-answer-id', answerId);

}

async function editHandler(e, courseId) {
    e.preventDefault();

    await UserModel.getCourse(courseId);

    ipc.send('edit-course-id', courseId);

}

async function editHandler1(e, questionId) {
    e.preventDefault();

    await UserModel.getQuestionById(questionId);

    ipc.send('edit-question-id', questionId);
}


function addClick() {
    let addWindow = new BrowserWindow({height: 800, width: 800, minimizable: false, maximizable: false, show: false })
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../views/add.html'),
        protocol: 'file',
        slashes: true
    }));
    addWindow.once("ready-to-show", () => {
        remote.getCurrentWindow().setEnabled(false);
        addWindow.show();
        
    });
    
    addWindow.on('close', (e) => {
        // addWindow.hide();
        remote.getCurrentWindow().setEnabled(true);
        e.preventDefault();
    });

}

function addClick1() {
    let addWindow = new BrowserWindow({height: 800, width: 800, minimizable: false, maximizable: false, show: false })
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../views/addQuestion.html'),
        protocol: 'file',
        slashes: true
    }));
    addWindow.once("ready-to-show", () => {
        remote.getCurrentWindow().setEnabled(false);
        addWindow.show();
        
    });
    
    addWindow.on('close', (e) => {
        remote.getCurrentWindow().setEnabled(true);
        e.preventDefault();
    });
}

function search() {
    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById('searchTxt');
    filter = input.value.toUpperCase();
    table = document.querySelector('.adminTbody');
    tr = table.getElementsByTagName('tr');
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName('td')[1];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

async function courseSelector() {
    courses = await UserModel.getCourses('kien.do');
    console.log(courses);
    const div = document.querySelector('.table-div');
    div.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
    <thead>
        <tr>
            <th>#</th>
            <th>Course</th>
            <th>Description</th>
            <th>Status</th>
            <th><span class="actionSpan">Action</span></th>
        </tr>
    </thead>
    <tbody class = "adminTbody">

    </tbody>
    `;
    div.appendChild(table);
    const tbody = document.querySelector('.adminTbody');

    for (const course of courses) {
        const tr = document.createElement('tr')
        tr.innerHTML = `
                <td>${course.id}</td>
                <td>${course.name}</td>
                <td>${course.descript}</td>
                <td class="valid-indicator">
              <span><button type="button" class="valid-button">${course.valid}</button></span>
            </td>
            <td>
                <div class="button-div">
                    <button class="editBtn">Edit</button>
                    <button class="deleteBtn" id="delete">Delete</button>
                </div>
            </td>
        `;

        if (course.valid) {
            tr.querySelector('.valid-indicator > span > button').classList.add('activespan');
            tr.querySelector('.valid-indicator > span > button').innerHTML = 'Active';
        } else {
            tr.querySelector('.valid-indicator > span > button').classList.add('unavailable');
            tr.querySelector('.valid-indicator > span > button').innerHTML = 'Unavailable';
        }

        tr.dataset.courseId = course.id;
        tr.querySelector('.deleteBtn').addEventListener('click', (e) => deleteHandler(e, course.id, tr));
        tr.querySelector('.editBtn').addEventListener('click', (e) => editHandler(e, course.id));

        tbody.appendChild(tr);

        tr.querySelector('.valid-button').addEventListener('click' ,async function(e){
            if (tbody.querySelector(`[data-course-id="${course.id}"]`)
            .querySelector('.valid-indicator > span > button').innerHTML === 'Active') {
                console.log(course.id);
                await UserModel.editStatus(course.id, 0);
                tbody.querySelector(`[data-course-id="${course.id}"]`)
                    .querySelector('.valid-indicator > span > button').classList.remove('activespan');
                tbody.querySelector(`[data-course-id="${course.id}"]`)
                    .querySelector('.valid-indicator > span > button').classList.add("unavailable");
                tbody.querySelector(`[data-course-id="${course.id}"]`)
                    .querySelector('.valid-indicator > span > button').innerHTML = 'Unavailable';

            } else if (tbody.querySelector(`[data-course-id="${course.id}"]`)
            .querySelector('.valid-indicator > span > button').innerHTML === 'Unavailable') {
                await UserModel.editStatus(course.id, 1);
                tbody.querySelector(`[data-course-id="${course.id}"]`)
                    .querySelector('.valid-indicator > span > button').classList.remove('unavailable');
                tbody.querySelector(`[data-course-id="${course.id}"]`)
                    .querySelector('.valid-indicator > span > button').classList.add("activespan");
                tbody.querySelector(`[data-course-id="${course.id}"]`)
                    .querySelector('.valid-indicator > span > button').innerHTML = 'Active';
            }
        });
    }

    ipc.on('course-added', (e, course) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${course.id}</td>
            <td>${course.name}</td>
            <td>${course.descript}</td>
            <td class="valid-indicator">
                <span>${course.valid}</span>
            </td>
            <td>
                <div>
                    <button class="editBtn">Edit</button>
                    <button class="deleteBtn" id="delete">Delete</button>
                </div>
            </td>
        `;

        if (course.valid) {
            tr.querySelector('.valid-indicator > span').classList.add('activespan');
            tr.querySelector('.valid-indicator > span').innerHTML = 'Active';
        } else {
            tr.querySelector('.valid-indicator > span').classList.add('unavailable');
            tr.querySelector('.valid-indicator > span').innerHTML = 'Unavailable';
        }

        tr.dataset.courseId = course.id; //set data-course-id for tr
        tr.querySelector('.deleteBtn').addEventListener('click', (e) => deleteHandler(e, course.id, tr));
        tr.querySelector('.editBtn').addEventListener('click', (e) => editHandler(e, course.id));

        document.querySelector('.adminTbody').appendChild(tr);
    });

    ipc.on('course-edit', (e, course) => {
        document.querySelector(`[data-course-id="${course.id}"]`)
            .querySelectorAll('td')[1].innerText = course.name;
        document.querySelector(`[data-course-id="${course.id}"]`)
            .querySelectorAll('td')[2].innerText = course.descript;
    });


}

async function questionSelector() {
    questions = await UserModel.getQuestion();
    console.log(questions);
    const div = document.querySelector('.table-div');
    div.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
    <table class="table" id="table" width="100%">
        <thead>
            <tr>
                <th>#</th>
                <th>Question</th>
                <th>CourseID</th>
                <th><span class="actionSpan">Action</span></th>
            </tr>
        </thead>
        <tbody class = "adminTbody">

        </tbody>
    </table>
    `;
    div.appendChild(table);
    const tbody = document.querySelector('.adminTbody');

    for (const question of questions) {
        const tr = document.createElement('tr')
        tr.innerHTML = `
                <td>${question.id}</td>
                <td>${question.content}</td>
                <td>${question.courseId}</td>
                <td>
                    <div>
                        <button class="editBtn">Edit</button>
                        <button class="deleteBtn" id="delete">Delete</button>
                    </div>
                </td>
        `;
        tr.dataset.questionId = question.id;
        console.log(question.id);
        tr.querySelector('.deleteBtn').addEventListener('click', (e) => deleteHandler1(e, question.id, tr));
        tr.querySelector('.editBtn').addEventListener('click', (e) => editHandler1(e, question.id));
        tbody.appendChild(tr);
    }

    ipc.on('question-added', (e, question) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${question.id}</td>
            <td>${question.content}</td>
            <td>${question.courseid}</td>
            <td>
                <div>
                    <button class="editBtn">Edit</button>
                    <button class="deleteBtn" id="delete">Delete</button>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });

    ipc.on('question-edit', (e, question) => {
        document.querySelector(`[data-question-id="${question.questionId}"]`)
            .querySelectorAll('td')[1]
            .innerText = question.content;
        document.querySelector(`[data-question-id="${question.questionId}"]`)
            .querySelectorAll('td')[2]
            .innerText = question.courseId;
        console.log(question);
    });

}

async function answerSelector() {
    answers = await UserModel.getAnswers();
    console.log(answers);
    const div = document.querySelector('.table-div');
    div.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
    <table class="table" id="table" width="100%">
        <thead>
            <tr>
                <th>#</th>
                <th>Answer</th>
                <th>Question ID</th>
                <th><span class="actionSpan">Action</span></th>
            </tr>
        </thead>
        <tbody class = "adminTbody">

        </tbody>
    </table>
    `;
    div.appendChild(table);
    const tbody = document.querySelector('.adminTbody');

    for (const answer of answers) {
        const tr = document.createElement('tr')
        tr.innerHTML = `
                <td>${answer.id}</td>
                <td>${answer.content}</td>
                <td>${answer.questionId}</td>
                <td>
                    <div>
                        <button class="editBtn">Edit</button>
                        <button class="deleteBtn" id="delete">Delete</button>
                    </div>
                </td>
        `;
        tr.dataset.answerId = answer.id;
        console.log(answer.id);
        tr.querySelector('.deleteBtn').addEventListener('click', (e) => deleteHandler2(e, answer.id, tr));
        tr.querySelector('.editBtn').addEventListener('click', (e) => editHandler2(e, answer.id));
        tbody.appendChild(tr);
    }

    ipc.on('answer-added', (e, answer) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                <td>${answer.id}</td>
                <td>${answer.content}</td>
                <td>${answer.questionid}</td>
                <td>
                    <div>
                        <button class="editBtn">Edit</button>
                        <button class="deleteBtn" id="delete">Delete</button>
                    </div>
                </td>
            `;
        tr.querySelector('.deleteBtn').addEventListener('click', (e) => deleteHandler2(e, answer.id, tr));
        tr.querySelector('.editBtn').addEventListener('click', (e) => editHandler2(e, answer.id));
        tbody.appendChild(tr);
    });

    ipc.on('answer-edit', (e, answer) => {
        document.querySelector(`[data-answer-id="${answer.id}"]`)
            .querySelectorAll('td')[1]
            .innerText = answer.content;
        console.log(answer);
    });

}