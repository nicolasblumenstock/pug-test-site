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
	res.send('LOGIN PAGE, YO')
});

router.get('/register', (req,res)=>{
	res.send('REGISTRATION PAGE')
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

module.exports = router;
