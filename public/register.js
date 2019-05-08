let $ = require('jquery')
let fs = require('fs')
const UserModel = require('../models/users_model.js');
const ipc = require('electron').ipcRenderer;

document.querySelector('#btn-register').addEventListener('click', (e) => {
    e.preventDefault();
    var username = $("#txtUsr").val();
    var password = $("#txtPwd").val();
    var cfpassword = $("#txtPwdConfirm").val();

    if (username == '' || password == '' || cfpassword == '') {
        alert("Please fill all fields...!!!!!!");
    } else if ((password.length) < 8) {
        alert("Password should atleast 8 character in length...!!!!!!");
    } else if (!(password).match(cfpassword)) {
        alert("Your passwords don't match. Try again?");
    } else {
        const data = UserModel.createUser(username, password);
            alert("You have Successfully Registered.....", "data");
            $("form")[0].reset();
        
    }
});




