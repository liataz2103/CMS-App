var express = require("express");
var router  = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var resizeImg = require("resize-img");
// let multer = require("multer");



// let storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/images');
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });




//get products page
router.get("/", function(req, res){
    var count;
    Product.count(function(err, c){
        count = c;
    });
    Product.find(function(err, products){
        res.render("admin/products", {
            products: products,
            count: count
        })
    })
    
});

// get add products form page
router.get("/add-product", function(req, res){
    // We pass the following variables
    var title = "";
    var desc= "";
    var price = "";
    // send request to db and render add product page with the following data receieved from the db
    Category.find(function (err, categories){
        res.render("admin/add_product", {
            title: title,
            categories: categories,
            desc: desc,
            price: price
        });
    });
	
});

// post products (get the posted inputs and send to)
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

//get edit category for one page 
router.get("/edit-category/:id", function(req, res){
    Category.findOne({slug: req.params.id}, function(err, category){
        if(err){
            return console.log(err);
        }else{
            res.render("admin/edit_category", {
            title: category.title,
            id: category._id
            })
        }
    });	
});

router.post("/edit-category/:id", function(req, res){
    // validate the title and the content with express validator
    req.checkBody('title', "Title must have a value").notEmpty();

    // get the content from the form
    var title = req.body.title;
    //slug- we should replace spaces with dashes and change to lowercase
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.body.id;
    var errors = req.validationErrors();
    

    if(errors){
        res.render("admin/edit_category", {
            title: title,
            errors: errors,
            id: id
        });
    }else {
        // make sure slug is unique (does not exist in db)- exluding this specifc page (since we know it exist)
        Category.findOne({title: title, _id: {$ne: id}}, function (err, category){
            if(category){
                req.flash('danger', 'Category title exist, choose another.');
                res.render("admin/add_category", {
                    title: title,
                });
            }else{
              Category.findById(id, function(err, category){
                  if (err)
                    return console.log(err);
                    category.title = title;
                    category.save(function(err){
                        if (err) 
                            return console.log(err);
                        req.flash('success', 'Category Added');
                        res.redirect('/admin/categories');
                });
            });
        }
    })
    }
})
             
// Get delete category
router.get("/delete-product/:id", function(req, res){
	Category.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err);
        req.flash('success', "Category Deleted");
        res.redirect('/admin/products/');
    });
});

module.exports = router;