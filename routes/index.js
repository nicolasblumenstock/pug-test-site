var express = require('express');
var router = express.Router();
var config = require('../config/config')
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
})

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'bytesAndBrews' });
});

router.get('/login', (req,res)=>{
	res.render('login', { })
});

router.get('/register', (req,res)=>{
	res.render('register', { })
});

router.get('/account', (req,res)=>{
	res.render('account', {})
})

router.get('/restaurants', (req,res)=>{
	res.render('restaurants', {})
})

router.get('/recipes', (req,res)=>{
	res.render('recipes', {})
})

router.get('/beverages', (req,res)=>{
	res.render('beverages', {})
})

router.get('/contact', (req,res)=>{
	res.render('contact', {})
})





////// Snooth
const snoothBaseUrl = "http://api.snooth.com/wines/";
const snoothBaseUrl2 = 'http://api.snooth.com/wine/';
const wineKey = config.wineKey;
const ip = '66.28.234.115';


var wineToSearch = wineName.split(' ').join('+');


// What color wine do you like? Red, white, rose, amber, clear? Get our preferences?
var wineColor = 't='+ colorSelected
var snoothTypeUrl = snoothTypeUrl + wineKey + ip + wineColor;


// Found a good wine? Input a particular wine and get recipes


// router.get('/beverages', function(req, res, next) {
// 	request.get(,(error, response, wineData)=>{
// 		var wineData = JSON.parse(wineData);
// 		res.render('beverages', { 
// 			wineName: wine[i].recipes.name,
// 			wineImage: wine[i].recipes.image,
// 			wineRecipeLink: wine[i].recipes.link

// 			});

// 	});

// });

router.post('/beverages', (req,res)=>{
	// req.body is availbale because of the body-parser module
	// req.body is where POSTED data will live
	// res.json(req.body);
	var wineId = wineName.split(' ').join('-');;
	var snoothRecipeUrl = snoothBaseUrl2 + wineKey + ip + wineId + '&food=1';
	request.get(snoothRecipeUrl2,(error, response, wineData)=>{
		// res.json(JSON.parse(wineData));
		var wineData = JSON.parse(wineData);
		res.render('beverages', { 
			wineName: wine[i].recipes.name,
			wineImage: wine[i].recipes.image,
			wineRecipeLink: wine[i].recipes.link

		});
	});

});

module.exports = router;
