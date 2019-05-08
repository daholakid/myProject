const $ = require('jquery');
const fs = require('fs');
let file = "coursetrain";
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const { BrowserWindow } = remote;
var ctx = {
    questionId: null
}
remote.getCurrentWindow().openDevTools();

ipc.send('editq-window-shown');

ipc.on('edit-question-id', async(e, questionId) => {
    const question = await UserModel.getQuestionById(questionId);
    console.log(question);
    document.querySelector('#contentEdit').value = question.content;
    document.querySelector('#idEdit').value = question.courseId;
    //document.querySelector('#descriptEdit').value = course.descript;
    ctx.questionId = questionId;
    console.log(ctx.questionId);
});

async function editQuestion() {
    let content = document.querySelector('#contentEdit').value;
    let courseId = document.querySelector('#idEdit').value;
    await UserModel.editQuestion(ctx.questionId, content, courseId);
    ipc.send('question-edit', {
        questionId: ctx.questionId,
        content: content,
        courseId: courseId,
    });

    alert('Question Edited...! - You can edit again');
    remote.getCurrentWindow().close();
}