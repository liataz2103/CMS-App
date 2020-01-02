var express = require("express");
var router  = express.Router();
var Page = require('../models/page');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;


//get afmin page
router.get("/", isAdmin, function(req, res){
	Page.find().sort({sorting: 1}).exec(function(err, pages){
        res.render('admin/pages', {
            pages: pages
        });
    });
});

// get add page form page
router.get("/add-page", isAdmin,  function(req, res){
    var title = "";
    var slug = "";
    var content = "";
	res.render("admin/add_page", {
        title: title,
        slug: slug,
        content: content
    });
});

// post to add-page
router.post("/add-page", isAdmin,  function(req, res){
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
                     // else we would set local variable pages with the resorted pages so it displays immediately
                     Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    req.flash('success', 'Page Added');
                    res.redirect('/admin/pages');
                });
            }
        });
    }	
});

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;
    // loop though the ids and change the sorting to be the counter num
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}


// Post reorder pages (change the sorting based on the order of the pages in the db)
router.post('/reorder-pages', function(req, res){
    // req.body gives us id with a list of ids 
    // console.log(req.body);
    var ids = req.body['id'];
    
    sortPages(ids, function(){
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                // set the local variable pages to be the resorted pages so it displays in real time
                req.app.locals.pages = pages;
            }
        });
    });

});

   
//get edit page for one page 
router.get("/edit-page/:id",  isAdmin, function(req, res){
    Page.findById(req.params.id, function(err, page){
        if(err){
            return console.log(err);
        }else{
            res.render("admin/edit_page", {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
            })
        }
    });	
});

router.post("/edit-page/:id", function(req, res){
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
    var id = req.params.id;
    var errors = req.validationErrors();
    

    if(errors){
        res.render("admin/edit_page", {
            title: title,
            slug: slug,
            content: content,
            errors: errors,
            id: id
        });
    }else {
        // make sure slug is unique (does not exist in db)- exluding this specifc page (since we know it exist)
        Page.findOne({slug: slug, _id: {$ne: id}}, function (err, page){
            if(page){
                req.flash('danger', 'Page slug exist, choose another.');
                res.render("admin/add_page", {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            }else{
              Page.findById(id, function(err, page){
                  if (err)
                    return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function(err){
                        if (err) 
                            return console.log(err);
                        // else we would set local variable pages with the resorted pages so it displays immediately
                        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.pages = pages;
                            }
                        });
                        req.flash('success', 'Page Added');
                        res.redirect('/admin/pages/edit-page/'+id);
                });
            });
        }
    })
    }
})
             
// Get delete page
router.get("/delete-page/:id", isAdmin,  function(req, res){
	Page.findByIdAndRemove(req.params.id, function(err){
        if (err) return console.log(err);

         // else we would set local variable pages with the resorted pages so it displays immediately
         Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });

        req.flash('success', "Page Deleted");
        res.redirect('/admin/pages/');
    });
});

module.exports = router;