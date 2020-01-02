var express = require("express");
var router  = express.Router();
var Category = require('../models/category');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

//get category page
router.get("/", isAdmin, function(req, res){
    Category.find(function(err, categories){
        if(err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

// get add category form page
router.get("/add-category", isAdmin,  function(req, res){
    var title = "";
	res.render("admin/add_category", {
        title: title,
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
                    title: title,
                    slug: slug
                });
                category.save(function(err){
                    if (err) return console.log(err);

                    Category.find(function(err, categories){
                        if(err){
                            console.log(err);
                        }else{
                            req.app.locals.categories = categories;
                        }
                    });
                    req.flash('success', 'Category Added');
                    res.redirect('/admin/categories');
                });
            }
        });
    }	
});

//get edit category for one page 
router.get("/edit-category/:id", isAdmin,  function(req, res){
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

                        Category.find(function(err, categories){
                            if(err){
                                console.log(err);
                            }else{
                                req.app.locals.categories = categories;
                            }
                        });
                        req.flash('success', 'Category Added');
                        res.redirect('/admin/categories');
                });
            });
        }
    })
    }
})
             
// Get delete category
router.get("/delete-category/:id", isAdmin,  function(req, res){
	Category.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err);
        Category.find(function(err, categories){
            if(err){
                console.log(err);
            }else{
                req.app.locals.categories = categories;
            }
        });
        req.flash('success', "Category Deleted");
        res.redirect('/admin/categories/');
    });
});

module.exports = router;