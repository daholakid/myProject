const { app, BrowserWindow, ipcMain } = require("electron")
const path = require('path');
const url = require('url');
var mainWindow = null;
var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename: path.join(__dirname, 'coursetrain.db')
    }
});

app.on("ready", () => {
    mainWindow = new BrowserWindow({ height: 768, width: 1366, minimizable: false, maximizable: false })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/login.html'),
        protocol: 'file',
        slashes: true
    }));
    mainWindow.once("ready-to-show", () => { mainWindow.show() })

    ipcMain.on('question-edit', (e, question) => {
        mainWindow.webContents.send('question-edit', question);
    });

    ipcMain.on('answer-edit', (e, answer) => {
        mainWindow.webContents.send('answer-edit', answer);
    })

    ipcMain.on('course-edit', (e, course) => {
        mainWindow.webContents.send('course-edit', course);
    })

    ipcMain.on("mainWindowLoaded", function() {
        let result = knex.select("username").from("users")
        result.then(function(rows) {
            mainWindow.webContents.send("resultSent", rows);

        })
        console.log('sdcfedr');
    });

    ipcMain.on('course-added', (e, course) => {
        mainWindow.webContents.send('course-added', course);
    });

    ipcMain.on('question-added', (e, question) => {
        mainWindow.webContents.send('question-added', question);
    });

    ipcMain.on('answer-added', (e, answer) => {
        mainWindow.webContents.send('answer-added', answer);
    });

    ipcMain.on('course-selected', (e, courseId) => {
        console.log(courseId);
        let questionWindow = new BrowserWindow({ height: 800, width: 800, minimizable: false, maximizable: false })

        questionWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/question.html'),
            protocol: 'file',
            slashes: true
        }));

        questionWindow.on('close', (e) => {
            questionWindow.hide();
            e.preventDefault();
        });

        questionWindow.webContents.once('dom-ready', () => {
            questionWindow.webContents.send('course-selected', courseId);
        });
    });

    ipcMain.on('edit-answer-id', (e, answerId) => {
        console.log(answerId);
        let editWindow = new BrowserWindow({ height: 250, width: 400, minimizable: false, maximizable: false, })

        editWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/editAnswer.html'),
            protocol: 'file',
            slashes: true
        }));

        editWindow.on('close', (e) => {
            editWindow.hide();
            mainWindow.setEnabled(true);
            e.preventDefault();
        });

        ipcMain.on('edita-window-shown', (e) => {
            mainWindow.setEnabled(false);
            editWindow.webContents.send('edit-answer-id', answerId);
        });
    });

    ipcMain.on('edit-question-id', (e, questionId) => {
        let editWindow = new BrowserWindow({ height: 250, width: 400, minimizable: false, maximizable: false })

        editWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/editQuestion.html'),
            protocol: 'file',
            slashes: true
        }));
        
        editWindow.on('close', (e) => {
            editWindow.hide();
            mainWindow.setEnabled(true);
            e.preventDefault();
            
        });
        
        mainWindow.setEnabled(false);
        ipcMain.on('editq-window-shown', (e) => {
            editWindow.webContents.send('edit-question-id', questionId)
        });
    });

    ipcMain.on('edit-course-id', (e, courseId) => {
        let editWindow = new BrowserWindow({ height: 800, width: 1000, minimizable: false, maximizable: false })

        editWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'views/edit.html'),
            protocol: 'file',
            slashes: true
        }));

        editWindow.on('close', (e) => {
            editWindow.hide();
            mainWindow.setEnabled(true);
            e.preventDefault();
        });

        ipcMain.on('edit-window-shown', (e) => {
            mainWindow.setEnabled(false);
            editWindow.webContents.send('edit-course-id', courseId);
        });


    });

});