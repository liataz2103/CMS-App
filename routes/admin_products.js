var express = require("express");
var router  = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var resizeImg = require("resize-img");

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

// get add category form page
router.get("/add-category", function(req, res){
    var title = "";
    var slug = "";
	res.render("admin/add_category", {
        title: title,
        slug: slug
    });
});

// post to add-page
router.post("/add-category", function(req, res){
    // validate the title and the content with express validator
    req.checkBody('title', "Title must have a value").notEmpty();

    // get the content from the form
    var title = req.body.title;
    //slug- we should replace spaces with dashes and change to lowercase
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var errors = req.validationErrors();
    

    if(errors){
        res.render("admin/add_category", {
            title: title,
            errors: errors
        });
    }else {
        // make sure slug is unique (does not exist in db)
        Category.findOne({slug: slug}, function(err, category){
            if(category){
                req.flash('danger', 'Category title exist, choose another.');
                res.render("admin/add_category", {
                    title: title
                });
            }else{
                var category = new Category ({
                    title: title
                });
                category.save(function(err){
                    if (err) return console.log(err);
                    req.flash('success', 'Category Added');
                    res.redirect('/admin/categories');
                });
            }
        });
    }	
});

// // Post reorder pages (change the sorting based on the order of the pages in the db)
// router.post('/reorder-pages', function(req, res){
//     // req.body gives us id with a list of ids 
//     // console.log(req.body);
//     var ids = req.body['id'];
//     var count = 0;
//     // loop though the ids and change the sorting to be the counter num
//     for(var i = 0; i<ids.length; i++){
//         var id = ids[i];
//         count++;
//         (function(count){

        
//         Page.findById(id, function(err, page){
//             page.sorting = count;
//             page.save(function (err){
//                 if(err){
//                     return console.log(err);
//                 }
//             });
//         });
//     })(count);
//     }
// });

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
router.get("/delete-category/:id", function(req, res){
	Category.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err);
        req.flash('success', "Category Deleted");
        res.redirect('/admin/categories/');
    });
});

module.exports = router;