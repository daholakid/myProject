const $ = require('jquery');
const fs = require('fs');
let file = "coursetrain";
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const { BrowserWindow } = remote;
var ctx = {
    answerId: null
}

remote.getCurrentWindow().openDevTools();

ipc.send('edita-window-shown');

ipc.on('edit-answer-id', async(e, answerId) => {
    const answer = await UserModel.getAnswerById(answerId);
    console.log(answer);
    console.log(answer.content);
    document.querySelector('#contentEdit').value = answer.content;
    //document.querySelector('#idEdit').value = question.courseId;
    //document.querySelector('#descriptEdit').value = course.descript;
    ctx.answerId = answerId;
    console.log(ctx.answerId);
});

async function editAnswer() {
    let content = document.querySelector('#contentEdit').value;
    //let courseId = document.querySelector('#idEdit').value;
    await UserModel.editAnswer(ctx.answerId, content);
    ipc.send('answer-edit', {
        id: ctx.answerId,
        content: content,
    });

    alert('Answer Edited...! - You can edit again');
    remote.getCurrentWindow().close();
}