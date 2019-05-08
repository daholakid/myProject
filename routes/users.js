var express = require('express')
var app = express();

//LOGIN IN APP
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function (err, rows, fields) {
            if (rows.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                // app.set('currentUser', username);
                res.redirect('/');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }

});

//GET LIST COURSES
app.get('/home', function (req, res, next) {
    req.getConnection(function (error, conn) {
        // let username = req.app.get('currentUser');
        conn.query('SELECT * FROM courses WHERE username ', function (err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('views/courses', {
                    title: 'Courses List',
                    data: ''
                })
            } else {
                // render to views/courses.html template file
                res.render('views/courses', {
                    title: 'User List',
                    data: rows
                })
            }
        })
    })
});

//GET LIST QUESTION
app.get('/home', function (req, res, next) {
    req.getConnection(function (error, conn) {
        // let username = req.app.get('currentUser');
        conn.query('SELECT * FROM question ', function (err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('views/question', {
                    title: 'Question List',
                    data: ''
                })
            } else {
                // render to views/courses.html template file
                res.render('views/question', {
                    title: 'Question List',
                    data: rows
                })
            }
        })
    })
});

// ADD NEW USER POST ACTION
app.post('/add', function (req, res, next) {
    req.assert('first_name', 'FirstName is required').notEmpty()           //Validate name
    req.assert('last_name', 'LastName is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = req.validationErrors()

    if (!errors) {   //No errors were found.  Passed Validation!

        var user = {
            first_name: req.sanitize('first_name'),
            last_name: req.sanitize('last_name'),
            email: req.sanitize('email')
        }

        req.getConnection(function (error, conn) {
            conn.query('INSERT INTO users SET ?', user, function (err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)

                    // render to views/user/add.ejs
                    res.render('user/add', {
                        title: 'Add New User',
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    })
                } else {
                    req.flash('success', 'Data added successfully!')

                    // render to views/user/add.ejs
                    res.render('user/add', {
                        title: 'Add New User',
                        name: '',
                        age: '',
                        email: ''
                    })
                }
            })
        })
    }
    else {   //Display errors to user
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */
        res.render('user/add', {
            title: 'Add New User',
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        })
    }
});

module.exports = app