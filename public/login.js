let $ = require('jquery')
let fs = require('fs')
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;

$('#btn-login').on('click', async(e) => {
    e.preventDefault();
    console.log(e);
    const username = document.querySelector('[name="username"]').value;
    const password = document.querySelector('[name="password"]').value;

    const datalog = await UserModel.findUser(username, password);

    if (username == '' || password == '') {
        alert("Please fill all fields...!!!!!!");
    } else if ((password.length) < 8) {
        alert("Password should atleast 8 character in length...!!!!!!");
    } else if (!datalog) {
        alert("Please register to be our member...!!!");
    } else if (username === 'kien.do') {
        require('electron').remote.getCurrentWindow().loadURL(__dirname + '/admin.html');
    } else {
        require('electron').remote.getCurrentWindow().loadURL(__dirname + '/courses.html');
    }

});