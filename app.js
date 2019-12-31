var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');


// Connect to db
mongoose.connect('mongodb://localhost/cmscart', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Init app
var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set global errors variable
app.locals.errors = null;

// Get Page Model
var Page = require('./models/page');

// Get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});


// Express fileUpload middleware
app.use(fileUpload());

// Body Parser middleware
// 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// parse application/json
app.use(bodyParser.json());

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
//  cookie: { secure: true }
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

// cart -> session called cart, which is basically an array that is going to hold objects that are products
app.get('*', function(req, res, next){
    res.locals.cart = req.session.cart; //now cart will be available in each get request
    next()
})

// Set routes 
var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var cart = require('./routes/cart.js');
var adminPages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/', pages);

// Start the server
var port = 3000;
app.listen(port, function () {
    console.log('Server started on port ' + port);
});











// var express = require('express');
// var path = require('path');
// var mongoose = require("mongoose");
// var bodyParser = require("body-parser");
// var session = require('express-session');
// var	expressValidator = require('express-validator');
// var fileUpload = require('express-fileupload');


// // connect DB 
// mongoose.connect('mongodb://localhost/cmscart', {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     });

// //init app
// var app = express ();

// // View engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// // set public folder
// app.use(express.static(path.join(__dirname, 'public')));

// // Set global errors variable
// app.locals.errors = null;

// // Get all  pages to access header.ejs (so that the pages links derive from the admin page)
// var Page= require('./models/page');
// // we get all the pages from the DB and put then inside of a variable pages. 
// // on the vie of the header we will loop this pages and for each page we will present li with the page on the nav based on the way they are sorted in admin pages
// Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
//     if (err) {
//         console.log(err);
//     } else {
//         app.locals.pages = pages;
//     }
// });

// // Get Category Model
// var Category = require('./models/category');

// // Get all categories to pass to header.ejs
// Category.find(function (err, categories) {
//     if (err) {
//         console.log(err);
//     } else {
//         app.locals.categories = categories;
//     }
// });


// // Express fileUpload middleware
// app.use(fileUpload());

// // Body Parser middleware
// // 
// // parse application/x-www-form-urlencoded

// app.use(bodyParser.urlencoded({extended: true}));
// // parse application/json
// app.use(bodyParser.json());




// // Express Session middleware
// app.use(session({
//     secret: 'keyboard cat',
//     resave: true,
//     saveUninitialized: true,
//     // cookie: { secure: true }
// }));


// // Express Validator middleware
// app.use(expressValidator({
//     errorFormatter: function (param, msg, value) {
//         var namespace = param.split('.')
//                 , root = namespace.shift()
//                 , formParam = root;

//         while (namespace.length) {
//             formParam += '[' + namespace.shift() + ']';
//         }
//         return {
//             param: formParam,
//             msg: msg,
//             value: value
//         };
//     },
//     customValidators: {
//         isImage: function (value, filename) {
//             var extension = (path.extname(filename)).toLowerCase();
//             switch (extension) {
//                 case '.jpg':
//                     return '.jpg';
//                 case '.jpeg':
//                     return '.jpeg';
//                 case '.png':
//                     return '.png';
//                 case '':
//                     return '.jpg';
//                 default:
//                     return false;
//             }
//         }
//     }
// }));

// // Express Messages middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//     res.locals.messages = require('express-messages')(req, res);
//     next();
// });





// // routes

// var pagesRouter = require("./routes/pages.js")
// var adminPagesRouter = require("./routes/admin_pages.js")
// var adminCategoryRouter = require("./routes/admin_categories.js")
// var adminProductsRouter = require("./routes/admin_products.js")
// var productsRouter = require("./routes/products.js")

// app.use('/', pagesRouter);
// app.use('/admin/pages', adminPagesRouter);
// app.use('/admin/categories', adminCategoryRouter)
// app.use('/admin/products', adminProductsRouter )
// app.use('/products', productsRouter);


// // start the server
// app.listen(3000, function(){
//     console.log("server started")
// })