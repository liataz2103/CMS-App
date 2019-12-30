var express = require("express");
var router  = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');


/*
 * GET all products
 */
router.get('/', function (req, res) {
	//router.get('/', isUser, function (req, res) {
	
		Product.find(function (err, products) {
			if (err){
				console.log(err);
			}else{
				res.render('all_products', {
					title: 'All products',
					products: products
				});
			}			
		});
	});
	

module.exports = router;