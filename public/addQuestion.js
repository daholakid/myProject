let $ = require('jquery')
let fs = require('fs')
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const { BrowserWindow } = remote;
const errValidate = {
    err1: 'Hay dien day du cau tra loi',
    err2: 'Hay chon it nhat 1 cau tra loi dung',
    err3: 'Please insert your question',

};

(async() => {
    const courses = await UserModel.getAllCourses();
    const select = document.querySelector('#courseDrop');
    select.innerHTML = '';
    for (const course of courses) {

        // select.innerHTML += `<option value="${course.id}">${course.name}</option>`;
        // --cách ngắn gọn

        const option = document.createElement('option');
        option.innerText = course.name;
        option.setAttribute('value', course.id);
        select.appendChild(option);
    }
})();

async function addQuestion() {
    let result = validateAddQuestionForm();
    if (result === false) {
        return;
    }
    let content = document.querySelector('#content').value;
    let category = document.querySelector('#category').value;
    let courseid = document.querySelector('#courseDrop').value;
    let type = document.querySelector('#typeDrop').value;
    console.log(content, category, courseid, type);
    const insertedQuestion = await UserModel.addQuestion(content, category, courseid, type);
    console.log(insertedQuestion.id);
    (async() => {
        let questionid = insertedQuestion.id;
        let answers = document.querySelectorAll("[name='answer']");
        let correctIds = [];
        let correctStr = '';
        for (let answer of answers) {
            let ansCont = answer.value;
            console.log(ansCont);
            if (ansCont) {
                let answersInDB = await UserModel.addAnswer(ansCont, questionid);
                let answerid = answersInDB.id;
                console.log(answerid);
                let checkedCorrect = answer.nextElementSibling;
                if (checkedCorrect.checked) {
                    correctIds.push(answerid);
                    checkedCorrect.checked = false;
                }

                ipc.send('answer-added', {
                    id: answerid,
                    content: ansCont,
                    questionid: questionid,
                });

            }
            if (correctIds.length > 0) {
                correctStr = correctIds.join();
            }

            if (correctStr) {
                await UserModel.addCorrectAnswer(questionid, correctStr);
            }
            answer.value = '';
        }
        document.querySelector('#content').value = '';
        document.querySelector('#category').value = '';
        alert('Question Added...!');
        
        ipc.send('question-added', {
            id: insertedQuestion.id,
            content: insertedQuestion.content,
            courseid: insertedQuestion.courseid,
        });

        remote.getCurrentWindow().close();



    })();


}

function validateAddQuestionForm() {
    let answerContents = document.querySelectorAll('[name="answer"]');
    let checkedDoms = document.querySelectorAll('[name="true"]');
    let questionContents = document.querySelector('#content').value;
    let hasContents = [];
    let checkedCorrect = false;
    let add = true;

    if (questionContents === '') {
        alert(errValidate.err3);
        return !add;
    }

    for (answer of answerContents) {
        if (answer.value !== '') {
            hasContents.push(answer);
        }
    }
    if (hasContents.length < 3) {
        alert(errValidate.err1);
        return !add;
    }

    for (checkedDom of checkedDoms) {
        if (checkedDom.checked) {
            let ans = checkedDom.previousSibling;
            if (ans.value !== '') {
                checkedCorrect = true;
            }
        }
    }

    if (!checkedCorrect) {
        alert(errValidate.err2);
        return !add;
    }
    return add;
}