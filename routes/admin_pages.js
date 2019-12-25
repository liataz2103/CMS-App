var express = require("express");
var router  = express.Router();
var Page = require('../models/page');

router.get("/", function(req, res){
	Page.find().sort({sorting: 1}).exec(function(err, pages){
        res.render('admin/pages', {
            pages: pages
        });
    });
});


router.get("/add-page", function(req, res){
    var title = "";
    var slug = "";
    var content = "";
	res.render("admin/add_page", {
        title: title,
        slug: slug,
        content: content
    });
});

router.post("/add-page", function(req, res){
    // validate the title and the content with express validator
    req.checkBody('title', "Title must have a value").notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    // get the content from the form
    var title = req.body.title;
    //slug- we should replace spaces with dashes and change to lowercase
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if(slug == ""){
        var slug = title.replace(/\s+/g, '-').toLowerCase();
    }
    var content = req.body.content;
    var errors = req.validationErrors();
    

    if(errors){
        res.render("admin/add_page", {
            title: title,
            slug: slug,
            content: content,
            errors: errors
        });
    }else {
        // make sure slug is unique (does not exist in db)
        Page.findOne({slug: slug}, function(err, page){
            if(page){
                req.flash('danger', 'Page slug exist, choose another.');
                res.render("admin/add_page", {
                    title: title,
                    slug: slug,
                    content: content
                });
            }else{
                var page = new Page ({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(function(err){
                    if (err) return console.log(err);
                    req.flash('success', 'Page Added');
                    res.redirect('/admin/pages');
                });
            }
        });
    }	
});

// Post reorder pages
// router.post('/reorder-pages', function(req, res){
//     var ids = req.body['id[]'];
//     var count = 0;

//     for(var i = 0; i<ids.length; i++){
//         var id = ids[i];
//         count++;

//         (function(count) {
//             page.findById(id, function (err, page) {
//                 page.sorting = count;
//                 page.save(function (err){
//                     if(err)
//                     return console.log(err);
//                 });
//             });
//         })(count);
//     }
// });

module.exports = router;