var express = require('express');
var router = express.Router();
var passport = require("passport")
var bcrypt = require("bcryptjs")
var config = require('../config/admin');

// Get user model
var User = require('../models/user');


// Get register view model
router.get('/register', function (req, res) {
    res.render('register', {
        title: "Register"
    });

});


// post register form

router.post('/register', function (req, res) {
    //create form variales
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var admin = 0;
    if (password == config.admin){
        admin = 1;
    }
    var password2 = req.body.password2;  
    //error validation  
    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();
    // if the user exist reirect else enter the user to db
    if(errors){
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        })
    }else{

        var user = new User ({
            name: name,
            email: email, 
            username: username,
            password: password,
            admin: admin
        });

        // encrypt password before saving inside the db

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(user.password, salt, function(err, hash){
                if (err)
                    console.log(err);
                user.password = hash;
                user.save(function (err){
                    if (err){
                        console.log(err);
                    }else{
                        req.flash('success', "You are  now registered");
                        res.redirect('/users/login')
                    }
                });
            });
        });
    }
});


// get login page
router.get('/login', function(req, res){
    if(res.locals.user) res.redirect('/');
    res.render('login', {
        title: "Log in"
    });
});

// post login page
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});


// get logout 
router.get('/logout', function(req, res){
    req.logout();
    
    req.flash('success', 'You are logged out!');
    res.redirect('/users/login');

});


// Exports
module.exports = router;


