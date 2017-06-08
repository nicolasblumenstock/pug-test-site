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
	res.send('LOGIN PAGE, YO');
});

router.get('/register', (req,res)=>{
	res.send('REGISTRATION PAGE');
});

router.get('/account', (req,res)=>{
	res.render('account', {});
});

router.get('/restaurants', (req,res)=>{
	res.render('restaurants', {});
});

router.get('/recipes', (req,res)=>{
	res.render('recipes', {});
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
	res.render('beverages', {});
});

router.get('/contact', (req,res)=>{
	res.render('contact', {});
});

module.exports = router;
