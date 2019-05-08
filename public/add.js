let $ = require('jquery')
let fs = require('fs')
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;
const { remote } = require('electron');
const { BrowserWindow } = remote;

document.querySelector('#add').addEventListener('click', async (e) => {
    e.preventDefault();
    let coursename = $('#name').val();
    let description = $('#description').val();

    if (coursename === '') {
        dialog.showErrorBox('Empty Course Name', 'Course name can not be empty...!!');
    } else if (description === '') {
        dialog.showErrorBox('Empty Description', 'And of course description can not be empty...!!')
    } else {
        let insertedC = await UserModel.addCourse(coursename, description, 1);
        alert("Add course successfully...!!!", "course");
        document.getElementById('name').value = '';
        document.getElementById('description').value = '';
        console.log(insertedC.id);
        ipc.send('course-added', {
            id: insertedC.id,
            name: coursename,
            descript: description,
        });
        remote.getCurrentWindow().close();
    }
});