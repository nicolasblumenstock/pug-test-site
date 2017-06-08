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
  res.render('index', {
  	title: 'bytesAndBrews',
  	sessionInfo: req.session
  	});
});

router.get('/login', (req,res)=>{
	var message = req.query.msg;
	if (message == 'badLogin'){
		message = 'Incorrect password entered.';
	}else if(message == 'badEmail'){
		message = 'Invalid Email Address';
	}else if(message == 'notloggedin'){
		message = 'You must log in to see Account.'
	}
	res.render('login', { message });
});

router.post('/loginProcess',(req,res)=>{
	var email = req.body.email;
	var password = req.body.password;
	var emailCheck = 'SELECT * FROM users WHERE email=?';
	connection.query(emailCheck,[email],(error,checkResults)=>{
		if(checkResults.length == 1){
			var match = bcrypt.compareSync(password,checkResults[0].password);
			if (match == true){
				req.session.name = checkResults[0].firstName;
				req.session.email = email;
				req.session.loggedin = true;
				res.redirect('/account?msg=loggedin');
			}else{
				res.redirect('/login?msg=badLogin');
			};
		}else{
			res.redirect('/login?msg=badEmail');
		}
	})

})

router.get('/register', (req,res)=>{
	var message = req.query.msg;
	if (message == 'takenEmail'){
		message = 'This Email is already attached to an Account.'
	}else if(message == 'passwords'){
		message = 'Passwords do not match. Please try again.'
	}else if(message == 'emptyField'){
		message = 'Please fill out all required fields. *'
	}
	res.render('register', { message })
});

router.post('/registerProcess', (req,res)=>{
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var phoneNumber = req.body.phoneNumber;	
	var email = req.body.email;
	var addressLine = req.body.addressLine;
	var city = req.body.city;
	var state = req.body.state;
	var zip = req.body.zip;
	var password = req.body.password;
	var password2 = req.body.password2;
	var emailCheck = 'SELECT * FROM users WHERE email=?';
	var registerQuery = 'INSERT INTO users (firstName,lastName,phoneNumber,email,addressLine,city,state,zip,password) VALUES(?,?,?,?,?,?,?,?,?)';

	if((firstName == '') || (lastName == '') || (email == '') || (zip == '') || (password == '') || (password2 == '')){
		res.redirect('/register?msg=emptyField');
	}else if (password == password2){
		connection.query(emailCheck,[email],(error,emailResults)=>{
			if (error) throw error;
			if (emailResults.length == 0){
				var hash = bcrypt.hashSync(password);
				connection.query(registerQuery,[
					firstName,
					lastName,
					phoneNumber,
					email,
					addressLine,
					city,
					state,
					zip,
					hash
					],(err,regResults)=>{
						if (err) throw err;
						req.session.name = firstName;
						req.session.email = email;
						req.session.loggedin = true;
						res.redirect('/account?msg=registered');
					});
			}else{
				res.redirect('/register?msg=takenEmail')
			}
		});
	}else if(password !== password2){
		res.redirect('/register?msg=passwords');
	};

});

router.get('/account', (req,res)=>{
	var accountQuery = 'SELECT * FROM users WHERE email=?'
	if ((req.session.loggedin == false) || (req.session.loggedin == undefined)){
		res.redirect('/login?msg=notloggedin')
	}else{
		var email = req.session.email;
		var message = req.query.msg;
		if (message == 'registered'){
			message = 'Welcome!'
		}else if (message == 'loggedin'){
			message = 'Welcome Back!'
		}else if(message == 'badPass'){
			message = 'Incorrect Password Entered.'
		}else if (message == 'noPass'){
			message = 'Password Required for Updating.'
		}else if(message == 'updated'){
			message = 'Account Updated.'
		}
		connection.query(accountQuery,[email],(error,results)=>{
			res.render('account', {
				message: message,
				firstName: results[0].firstName,
				lastName: results[0].lastName,
				phoneNumber: results[0].phoneNumber,
				email: results[0].email,
				addressLine: results[0].addressLine,
				city: results[0].city,
				state: results[0].state,
				zip: results[0].zip
			});
		})
	}
})

router.post('/updateProcess', (req,res)=>{
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var phoneNumber = req.body.phoneNumber;	
	var oldEmail = req.body.oldEmail;
	var newEmail = req.body.newEmail;
	var addressLine = req.body.addressLine;
	var city = req.body.city;
	var state = req.body.state;
	var zip = req.body.zip;
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var checkQuery = 'SELECT * FROM users WHERE email=?';
	var updateQuery = 'UPDATE users SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, addressLine = ?, city = ?, state = ?, zip = ?, password = ? WHERE id = ?';
	if (oldPassword == ''){
		res.redirect('/account?msg=noPass')
	}else if(newPassword == ''){
		connection.query(checkQuery,[oldEmail],(error,initResults)=>{
			if (error) throw error;
			var id = initResults[0].id;
			var match = bcrypt.compareSync(oldPassword,initResults[0].password); 
			if (match == false){
				res.redirect('/account?msg=badPass');
			}else if(newEmail !== ''){
				var hash = initResults[0].password;
				connection.query(updateQuery, [
					firstName,
					lastName,
					phoneNumber,
					newEmail,
					addressLine,
					city,
					state,
					zip,
					hash,
					id
					],(err,newResults)=>{
						req.session.email = newEmail;
						res.redirect('/account?msg=updated');
					})
			}else if(newEmail == ''){
				var hash = initResults[0].password;
				connection.query(updateQuery, [
					firstName,
					lastName,
					phoneNumber,
					oldEmail,
					addressLine,
					city,
					state,
					zip,
					hash,
					id
					],(err,oldResults)=>{
						req.session.email = oldEmail;
						res.redirect('/account?msg=updated');
					});
			}
		})
	}else if(newPassword !== ''){
		connection.query(checkQuery,[oldEmail],(error,initResults)=>{
			if (error) throw error;
			var id = initResults[0].id;
			var match = bcrypt.compareSync(oldPassword,initResults[0].password); 
			if (match == false){
				res.redirect('/account?msg=badPass');
			}else if(newEmail !== ''){				
				var hash = bcrypt.hashSync(newPassword);
				connection.query(updateQuery, [
					firstName,
					lastName,
					phoneNumber,
					newEmail,
					addressLine,
					city,
					state,
					zip,
					hash,
					id
					],(err,newResults)=>{
						req.session.email = newEmail;
						res.redirect('/account?msg=updated');
					})
			}else if(newEmail == ''){
				var hash = bcrypt.hashSync(newPassword);
				connection.query(updateQuery, [
					firstName,
					lastName,
					phoneNumber,
					oldEmail,
					addressLine,
					city,
					state,
					zip,
					hash,
					id
					],(err,oldResults)=>{
						req.session.email = oldEmail;
						res.redirect('/account?msg=updated');
					});
			}		
		})
	}
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


// var wineToSearch = wineName.split(' ').join('+');


// What color wine do you like? Red, white, rose, amber, clear? Get our preferences?
// var wineColor = 't='+ colorSelected
// var snoothTypeUrl = snoothTypeUrl + wineKey + ip + wineColor;


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


//wine api calls
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
