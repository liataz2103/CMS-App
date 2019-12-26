var express = require('express');
var path = require('path');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var session = require('express-session');
var	expressValidator = require('express-validator');
var Page= require('./models/page')
var fileUpload = require('express-fileupload');


//init app
var app = express ();
app.set('view engine', 'ejs');

// connect DB 
mongoose.connect('mongodb://localhost/cmscart', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    });

// Express fileUpload middleware
app.use(fileUpload());

app.use(bodyParser.urlencoded({extended: true}));
// set public folder
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}));


// Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Set global errors variable
app.locals.errors = null;

// routes

var pagesRouter = require("./routes/pages.js")
var adminPagesRouter = require("./routes/admin_pages.js")
var adminCategoryRouter = require("./routes/admin_category.js")
var adminProductsRouter = require("./routes/admin_products.js")

app.use('/', pagesRouter);
app.use('/admin/pages', adminPagesRouter);
app.use('/admin/categories', adminCategoryRouter)
app.use('/admin/products', adminProductsRouter )

// start the server
app.listen(3000, function(){
    console.log("server started")
})