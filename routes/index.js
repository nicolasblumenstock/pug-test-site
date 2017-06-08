var express = require('express');
var router = express.Router();
var config = require('../config/config')
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
});

var yummlyCreds = `_app_id=${config.yummly.id}&_app_key=${config.yummly.key}&`
var baseYummlyMultiSearchUrl = `https://api.yummly.com/v1/api/recipes?${yummlyCreds}`

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
});

router.post('/random-recipe', (req,res)=>{
	// var cuisines = ['American', 'Italian', 'Asian', 'Mexican',
	// 'French', 'Southwestern', 'Barbecue', 'Indian', 'Chinese', 'English',
	// 'Mediterranean', 'Greek', 'Spanish', 'German', 'Thai', 'Moroccan', 'Irish', 'Japanese', 
	// 'Cuban', 'Hawaiin', 'Swedish', 'Hungarian', 'Portugese'];
	// var randomNumForCuisine = Math.floor(Math.random() * cuisines.length);
	// var searchCuisine = `&allowedCuisine[]=cuisine^cuisine-${cuisines[randomNumForCuisine]}`;
	var randomNumForSearch = Math.floor(Math.random() * 2000);
	var searchResults = `&maxResult=1&start=${randomNumForSearch}`
	var dinnerParam = '&allowedCourse[]=course^course-Main%20Dishes'
	var requirePics = '&requirePictures=true'
	var searchUrl = baseYummlyMultiSearchUrl + searchResults + dinnerParam + requirePics;
	// console.log(searchUrl);

	request.get(searchUrl, (error,res,data)=>{
		if (error) throw error;
		var recipeData = JSON.parse(data);
		console.log(recipeData.matches[0].recipeName)
		// console.log(recipeData)
	});
});

router.get('/beverages', (req,res)=>{
	res.render('beverages', {})
})

router.get('/contact', (req,res)=>{
	res.render('contact', {})
})





////// Snooth
// const snoothBaseUrl = "http://api.snooth.com/wines/";
// const snoothBaseUrl2 = 'http://api.snooth.com/wine/';
// const wineKey = config.wineKey;
// const ip = '66.28.234.115';


// var wineToSearch = wineName.split(' ').join('+');


// // What color wine do you like? Red, white, rose, amber, clear? Get our preferences?
// var wineColor = 't='+ colorSelected
// var snoothTypeUrl = snoothTypeUrl + wineKey + ip + wineColor;


// // Found a good wine? Input a particular wine and get recipes


// // router.get('/beverages', function(req, res, next) {
// // 	request.get(,(error, response, wineData)=>{
// // 		var wineData = JSON.parse(wineData);
// // 		res.render('beverages', { 
// // 			wineName: wine[i].recipes.name,
// // 			wineImage: wine[i].recipes.image,
// // 			wineRecipeLink: wine[i].recipes.link

// // 			});

// // 	});

// // });

// router.post('/beverages', (req,res)=>{
// 	// req.body is availbale because of the body-parser module
// 	// req.body is where POSTED data will live
// 	// res.json(req.body);
// 	var wineId = wineName.split(' ').join('-');;
// 	var snoothRecipeUrl = snoothBaseUrl2 + wineKey + ip + wineId + '&food=1';
// 	request.get(snoothRecipeUrl2,(error, response, wineData)=>{
// 		// res.json(JSON.parse(wineData));
// 		var wineData = JSON.parse(wineData);
// 		res.render('beverages', { 
// 			wineName: wine[i].recipes.name,
// 			wineImage: wine[i].recipes.image,
// 			wineRecipeLink: wine[i].recipes.link

// 		});
// 	});

// });

module.exports = router;
