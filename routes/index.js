var express = require('express');
var router = express.Router();
var config = require('../config/config')
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var request = require('request');
var arrays = require('../arrays/arrays');
var recipeData = require('../JSON/recipeJSON')
var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
});

var yummlyCreds = `_app_id=${config.yummly.id}&_app_key=${config.yummly.key}`
var baseYummlyMultiSearchUrl = `https://api.yummly.com/v1/api/recipes?${yummlyCreds}`

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
  	title: 'Wine & Dine',
  	sessionInfo: req.session
  	});
  console.log(req.session.userID)
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
	res.render('login', {
		message: message,
		sessionInfo: req.session
		});
	});

router.post('/loginProcess',(req,res)=>{
	var email = req.body.email;
	var password = req.body.password;
	var emailCheck = 'SELECT * FROM users WHERE email=?';
	connection.query(emailCheck,[email],(error,checkResults)=>{
		if(checkResults.length == 1){
			var match = bcrypt.compareSync(password,checkResults[0].password);
			if (match == true){
				console.log(checkResults);
				req.session.name = checkResults[0].firstName;
				req.session.email = email;
				req.session.loggedin = true;
				req.session.userID = checkResults[0].id;
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
	res.render('register', {
		message,
		sessionInfo: req.session
		})
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
						req.session.userId = emailResults[0].id;
						res.redirect('/account?msg=registered', {
							sessionInfo: {
								name: firstName,
								email: email,
								loggedin: true,
								userId: emailResults[0].id
							}
						});
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
		}else if(message == 'saved'){
			message = 'Recipe Saved.'
		}
		connection.query(accountQuery,[email],(error,results)=>{
			var firstName = results[0].firstName
			var lastName = results[0].lastName
			var phoneNumber = results[0].phoneNumber
			var email = results[0].email
			var addressLine = results[0].addressLine
			var city = results[0].city
			var state = results[0].state
			var zip = results[0].zip
			var userId = results[0].id
			var sessionInfo = req.session
			var savedRecipeQuery = 'SELECT * FROM favorites WHERE userID=?'
			// console.log(userId)

			connection.query(savedRecipeQuery, [userId], (error,results)=>{
				console.log(results)
				var httpDone = 0;
				var faveArray = [];
				for(let i = 0; i < results.length; i++){
					var thisRecipeId = results[i].recipeID;
					console.log(thisRecipeId)
					var thisRecipeUrl = 'https://api.yummly.com/v1/api/recipe/' + thisRecipeId + '?' + yummlyCreds;
					request.get(thisRecipeUrl, (error,response,data)=>{
						httpDone++;
						console.log(httpDone)
						var recipeData = JSON.parse(data);
						faveArray.push(recipeData)
						if (httpDone == results.length){
							res.render('account', {
								recipes: faveArray,
								message: message,
								firstName: firstName,
								lastName: lastName,
								phoneNumber: phoneNumber,
								email: email,
								addressLine: addressLine,
								city: city,
								state: state,
								zip: zip,
								userId: userId,
								sessionInfo: sessionInfo
							})
							// res.json(faveArray)
						}	
					})
				}

				// res.render('account', {
				// 	recipeArray: results,
				// 	message: message,
				// 	firstName: firstName,
				// 	lastName: lastName,
				// 	phoneNumber: phoneNumber,
				// 	email: email,
				// 	addressLine: addressLine,
				// 	city: city,
				// 	state: state,
				// 	zip: zip,
				// 	userId: userId,
				// 	sessionInfo: sessionInfo
				// });
			});
		});
	};
});

router.post('/faveRecipes/:recID', (req,res)=>{
	var thisRecipeId = req.params.recID;
	var thisRecipeUrl = 'https://api.yummly.com/v1/api/recipe/' + thisRecipeId + '?' + yummlyCreds;

	request.get(thisRecipeUrl, (error,response,data)=>{
		var faveArray = [];
		var recipeData = JSON.parse(data);
		faveArray.push(recipeData)
		res.render('recipes?msg=fave', {
			recipes: faveArray,
			cuisines: arrays.cuisines,
			cuisinesSearch: arrays.cuisinesSearch,
			diets: arrays.diets,
			dietsSearch: arrays.dietsSearch,
			allergies: arrays.allergies,
			allergiesSearch: arrays.allergiesSearch,
			sessionInfo: req.session
		})
	})
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
						req.session.id = newResults[0].id;
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
						req.session.id = oldResults[0].id;
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
						req.session.id = newResults[0].id;
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
						req.session.id = oldResults[0].id;
						res.redirect('/account?msg=updated');
					});
			}		
		})
	}
})
////////restaurants/////////////////
router.get('/restaurants', (req,res)=>{
	var message = req.query.msg;
	if (message == 'login'){
		message = 'Please Log In To Use This Feature'
	}
	res.render('restaurants', {
		message: message,
		sessionInfo: req.session
	})
})

router.post('/random-rest', (req,res)=>{
	if (req.session.email == undefined){
		res.redirect('/restaurants?msg=login')
	}else if (req.session !== undefined){
		var email = req.session.email;
		var checkQuery = 'SELECT * FROM users WHERE email=?';
		connection.query(checkQuery, [email], (error,checkResults)=>{
			// console.log(checkResults)
			var city = checkResults[0].city;
			var state = checkResults[0].state;
			var location = city + ', ' + state;
			// console.log(city,state,location)
			var searchUrl = "https://developers.zomato.com/api/v2.1/locations?query=" + city;
			var creds = {
				url: searchUrl,
				headers: {
					'user-key': 'c3f72d6b6e5474936f491150b9e3c476'
					}
				}
			request.get(creds, (error, response, localeData)=>{
				var locale = JSON.parse(localeData)
				console.log(locale)
				var cityID = locale.location_suggestions[0].entity_id;
				console.log(cityID)
				// for(let i = 0; i < locale.location_suggestions.length; i++){
				// 	if (locale.location_suggestions[i].name == location){
				// 		cityID = locale.location_suggestions[i].id;
				// 		break
				// 	}
				// }
				var start = Math.floor(Math.random()*20)
				var count = 25;
				// var secUrl = 'https://developers.zomato.com/api/v2.1/search?entity_id=' + cityID + 'entitytype=city&start=' + start + '&count=' + count;
				// console.log(secUrl)
				// console.log('https://developers.zomato.com/api/v2.1/search?entity_id=' + cityID + 'entitytype=city&count=25')
				var credsDos = {
					url: 'https://developers.zomato.com/api/v2.1/search?entity_id=' + cityID + '&entity_type=city&count=25&start=' + start + '&count=' + count,
					headers: {
						'user-key': "c3f72d6b6e5474936f491150b9e3c476"
					}
				}
				request.get(credsDos, (error, response, restData)=>{
					var restDatas = JSON.parse(restData);
					// res.json(restDatas)
					var randomRest = restDatas.restaurants[Math.floor(Math.random()* 15)].restaurant
					console.log(randomRest)
					res.render('restaurants', {
						sessionInfo: req.session,
						randomRest: randomRest
					})
				})
				}
			)
		})
	}
})
	

router.post('/search',(req,res)=>{
	var locationName = req.body.searchString
	var searchUrl = "https://developers.zomato.com/api/v2.1/locations?query=" + locationName;
	var creds = {
		url: searchUrl,
		headers:{
			"user-key": "c3f72d6b6e5474936f491150b9e3c476"
		}
	}
	request.get(creds, (error,response,locationData)=>{
		console.log(response);
		var locationData = JSON.parse(locationData);
		var entType = locationData.location_suggestions[0].entity_type
		var entID = locationData.location_suggestions[0].entity_id
		var locDetUrl = "https://developers.zomato.com/api/v2.1/location_details?"
		var newCreds = `${locDetUrl}entity_id=${entID}&entity_type=${entType}`
		var newUrl = {
			url: newCreds,
			headers:{
				"user-key": "c3f72d6b6e5474936f491150b9e3c476"
			}
		}
		// res.json(locationData);
// 		// res.render('city',{cityData: cityData});
		request.get(newUrl, (error,repsonse, nextData)=>{
			var nextData = JSON.parse(nextData);
			// console.log(nextData.nearby_res[0]);


			// res.json(nextData);
			// res.render('res-results', {nextData: nextData});
			var nearResIds = nextData.nearby_res;
			var totalNearRes = nearResIds.length
			for(let i = 0; i<totalNearRes; i++){
				var nearbyResUrl = "https://developers.zomato.com/api/v2.1/restaurant?res_id=" + nearResIds[i];
				var resCred = {
					url: nearbyResUrl,
					headers: {
						"user-key": "c3f72d6b6e5474936f491150b9e3c476"
					}
				}
				var nearbyResArray = [];
/////////////////////////////////////////////////////////////////////////////////////
///////////////////////////API CALL TO ZOMATO///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
				request.get(resCred,(error,response,resName2)=>{
					var resName = JSON.parse(resName2)
					// var x = encodeURI(resName)
					nearbyResArray.push(resName)
					// res.json(resName);
					// res.render('result', {resName: resName});
					if(nearbyResArray.length == totalNearRes){
						// res.json(nearbyResArray)
						res.render('result', {nearbyResArray: nearbyResArray});
					}

				});
				// res.render('result',{
				// 	nearbyResArray: arrays.searchJSON,
				// 	sessionInfo: req.session
				// })
			}
		});
	
	});
	
});

router.post('/searchTopRated',(req,res)=>{
	var locationName = req.body.searchBest
	var searchUrl = "https://developers.zomato.com/api/v2.1/locations?query=" + locationName;
	var creds = {
		url: searchUrl,
		headers:{
			"user-key": "4dd26c0b6b70bcd2ab9b055e2036ab46"
		}
	}
/////////////////////////////////////////////////////////////////////////////////////
///////////////////////////API CALL TO ZOMATO///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////	
	request.get(creds, (error,response,locationData)=>{
		var locationData = JSON.parse(locationData);
		var entType = locationData.location_suggestions[0].entity_type
		var entID = locationData.location_suggestions[0].entity_id
		var locDetUrl = "https://developers.zomato.com/api/v2.1/location_details?"
		var newCreds = `${locDetUrl}entity_id=${entID}&entity_type=${entType}`
		var newUrl = {
			url: newCreds,
			headers:{
				"user-key": "4dd26c0b6b70bcd2ab9b055e2036ab46"
			}
		}
		request.get(newUrl, (error,repsonse, nextData)=>{
			var nextData = JSON.parse(nextData)
			console.log(nextData.best_rated_restaurant[0].restaurant.name)
			// res.json(nextData);
			res.render('top-rated', {nextData: nextData})

		});

	});
	// res.render('top-rated', { 
	// 	nextData: arrays.topRated,
	// 	sessionInfo: req.session
	// 	})

});

router.get('/maps', (req,res)=>{
	res.render('maps', { });
});

router.get('/recipes', (req,res)=>{
	res.render('recipes', {	
		cuisines: arrays.cuisines,
		cuisinesSearch: arrays.cuisinesSearch,
		diets: arrays.diets,
		dietsSearch: arrays.dietsSearch,
		allergies: arrays.allergies,
		allergiesSearch: arrays.allergiesSearch,
		sessionInfo: req.session
	})
})

router.post('/recipeform', (req,res)=>{
	var included = req.body.includingingredients;
	var excluded = req.body.excludingingredients;
	var cuisine = req.body.cuisine;
	var diet = req.body.diet;
	var allergy = req.body.allergy;
	var incArray = included.split(', ');
	var exArray = excluded.split(', ');
	var includeQuery = '';
	var excludeQuery = '';
	for (let i = 0; i < incArray.length; i++){
		includeQuery += '&allowedIngredient[]=' + incArray[i];
	}
	for (let i = 0; i < exArray.length; i++){
		excludeQuery += '&excludedIngredient[]=' + exArray[i];
	}
	var allergyQuery = '&allowedAllergy[]=' + allergy;
	var cuisineQuery = '&allowedCuisine[]=' + cuisine;
	var dietQuery = '&allowedDiet[]=' + diet;
	if (allergy == ''){
		allergyQuery = '';
	}
	if (cuisine == ''){
		cuisineQuery = '';
	}
	if (diet == ''){
		dietQuery = '';
	}
	if (includeQuery == '&allowedIngredient[]='){
		includeQuery = '';
	}
	if (excludeQuery == '&excludedIngredient[]='){
		excludeQuery = '';
	}
	var searchUrl = baseYummlyMultiSearchUrl + cuisineQuery + includeQuery + excludeQuery + allergyQuery + dietQuery + '&maxResult=5&allowedCourse[]=course^course-Main%20Dishes';
	request.get(searchUrl, (error,response,queryData)=>{
		var queryData = JSON.parse(queryData);
		var recipeData = [];
		var httpDone = 0;

		for (let i = 0; i < queryData.matches.length; i++){
			var recipeUrl = 'https://api.yummly.com/v1/api/recipe/' + queryData.matches[i].id + '?' + yummlyCreds;
			// console.log(recipeUrl)
			request.get(recipeUrl, (err,respond,data)=>{
				httpDone++;
				var recData = JSON.parse(data);
				recipeData.push(recData);
				if (httpDone == queryData.matches.length){
					res.render('recipes', {
						recipes: recipeData,
						cuisines: arrays.cuisines,
						cuisinesSearch: arrays.cuisinesSearch,
						diets: arrays.diets,
						dietsSearch: arrays.dietsSearch,
						allergies: arrays.allergies,
						allergiesSearch: arrays.allergiesSearch,
						sessionInfo: req.session
					})
					// res.json(recipeData)
				}
			});
		}
		// console.log(recipeData)
	})
})

router.post('/random-recipe', (req,res)=>{
	// res.render('recipes', {
	// 	recipes: recipeData,
	// 	cuisines: arrays.cuisines,
	// 	cuisinesSearch: arrays.cuisinesSearch,
	// 	diets: arrays.diets,
	// 	dietsSearch: arrays.dietsSearch,
	// 	allergies: arrays.allergies,
	// 	allergiesSearch: arrays.allergiesSearch,
	// 	sessionInfo: req.session
	// })
	var randomNumForSearch = Math.floor(Math.random() * 2000);
	var searchResults = `&maxResult=5&start=${randomNumForSearch}`
	var dinnerParam = '&allowedCourse[]=course^course-Main%20Dishes'
	var requirePics = '&requirePictures=true'
	var searchUrl = baseYummlyMultiSearchUrl + searchResults + dinnerParam + requirePics;
	// console.log(searchUrl);

	request.get(searchUrl, (error,response,data)=>{
		if (error) throw error;
		var data = JSON.parse(data);
		var recipeData = [];
		// var recipeImg = [];
		var httpDone = 0;
		for (let i = 0; i < data.matches.length; i++){
			var recipeUrl = 'https://api.yummly.com/v1/api/recipe/' + data.matches[i].id + '?' + yummlyCreds;
			request.get(recipeUrl, (error,response, queryData)=>{
				if (error) throw error;
				httpDone++;
				var recData = JSON.parse(queryData);
				recipeData.push(recData);
				// recipeImg.push(recData.images[0].imageUrlsBySize.360)
				if (httpDone == data.matches.length){
					res.render('recipes', {
						recipes: recipeData,
						cuisines: arrays.cuisines,
						cuisinesSearch: arrays.cuisinesSearch,
						diets: arrays.diets,
						dietsSearch: arrays.dietsSearch,
						allergies: arrays.allergies,
						allergiesSearch: arrays.allergiesSearch,
						sessionInfo: req.session
					});
					// res.json(recipeData);
				}
			});
		}
		// console.log(recipeData.matches[0].recipeName)
 	});
});

router.get('/saverecipe/:id/:name', (req,res)=>{
	var recipeId = req.params.id;
	var recipeName = req.params.name
	var userId = req.session.userID;
	var insertQuery = "INSERT INTO favorites (userID, recipeID, recipeName) VALUES (?,?,?)";

	connection.query(insertQuery, [userId, recipeId, recipeName], (error,result)=>{
		if (error) throw error;
		res.redirect('/account?msg=saved');
	})
})

router.get('/beverages', (req,res)=>{
	res.render('beverages', {
		sessionInfo: req.session
	})
})

router.get('/contact', (req,res)=>{
	res.render('contact', {
		sessionInfo: req.session
	})
})





////// Snooth
// const snoothBaseUrl = "http://api.snooth.com/wines/";
// const snoothBaseUrl2 = 'http://api.snooth.com/wine/';
// const wineKey = config.wineKey;
// const ip = '66.28.234.115';


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



////// Snooth
const snoothBaseUrl = "http://api.snooth.com/wines/";
const snoothBaseUrl2 = 'http://api.snooth.com/wine/';
const snoothBaseUrlRating = 'http://api.snooth.com/rate/';
const wineKey = config.wineKey;
const ip = '&ip=66.28.234.115';




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
//'http://api.snooth.com/wines/?akey=8jncs6kpdwlsv2gkd24zqiyadfzhi0b07ybsajsldrssfgpg&ip=75.63.122.172&color=red'

router.post('/color', (req,res)=>{
	// req.body is availbale because of the body-parser module
	// req.body is where POSTED data will live
	console.log(req.body);	
	var wineType = (req.body.searchType);
	var wineColor = (req.body.searchColor);
	var wineKind = (req.body.searchVariety);
	var wineVariety = wineKind.replace(" ","+");
	var wine$MinPrice = (req.body.searchMinPrice);
	var wine$MaxPrice = (req.body.searchMaxPrice);
	var wineMinPrice = wine$MinPrice.replace("$","");
	var wineMaxPrice = wine$MaxPrice.replace("$","");
	var wineSort = (req.body.searchSort);
	var wineNumber = (req.body.searchNumber);

////////// Wine Query
	var wineTypeQuery = '&t=' + wineType;
	var wineColorQuery = '&color=' + wineColor;
	var wineVarietyQuery = '&q=' + wineVariety;
	var wineMinPriceQuery = '&mp=' + wineMinPrice;
	var wineMaxPriceQuery = '&xp=' + wineMaxPrice;
	var wineSortQuery = '&s=' + wineSort;
	// var wineNumberQuery = '&n=' + wineNumber;
	console.log(wineKind);

	var endQuery = '&mr=4&n=20';

	// if(wineType == ''){
	// 	wineTypeQuery = '';
	// }
	if(wineColor == ''){
		wineColorQuery = '';
	}
	if(wineKind == ''){
		wineVarietyQuery = '';
	}
	if(wineMinPrice == ''){
		wineMinPriceQuery = '&mp=1';
	}
	if(wineMaxPrice == ''){
		wineMaxPriceQuery = '';
	}
	if(wineSort == ''){
		wineSortQuery = '';
	}
	if(wineSort == 'Price &#8679'){
		wineSortQuery = '&s=price+asc';
	}
	if(wineSort == 'Price &#8681'){
		wineSortQuery = '&s=price+desc';
	}
	// if(wineNumber = ''){
	// 	wineNumberQuery = '&n=20';
	// }

	var wineCellarUrl = snoothBaseUrl + wineKey + ip + wineColorQuery + wineVarietyQuery + wineMinPrice + wineMaxPriceQuery + wineSortQuery + endQuery;
	console.log(wineCellarUrl);

/////////////END

	// console.log(wineColor)
	var snoothWineSelectUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&mp=1&mr=4&n=20';
	// var snoothWineSelectUrlTest = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&color=' + wineColor + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&s=' wineSort;
	var snoothColorUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&color='+ wineColor + '&q=' + wineVariety + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&mr=4&n=20'; 
	var snoothPriceAscUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&color='+ wineColor + '&q=' + wineVariety + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&s=price+asc&mr=4&n=20';
	var snoothPriceDesUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&color='+ wineColor + '&q=' + wineVariety + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&s=price+asc&mr=4&n=20';// var snoothColorUrl2 = snoothBaseUrl + wineKey + ip + '&color='+ wineColor + '&mr=4&mp=1' +'&xp=' + wineMaxPrice;
	var snoothNoColorUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&q=' + wineVariety + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&mr=4&n=20'; 
	
	var snoothNoColorPriceAscUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&q=' + wineVariety + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&s=price+asc&mr=4&n=20';
	var snoothNoColorPriceDesUrl = snoothBaseUrl + wineKey + ip + '&t=' + wineType + '&q=' + wineVariety + '&mp=' + wineMinPrice + '&xp=' + wineMaxPrice + '&s=price+des&mr=4&n=20';
	// var snoothVarietyUrl = snoothBaseUrl + wineKey + ip + '&q=' + wineVariety + '&mr=4&mp=1&s=price+desc&qpr=vintage+desc'+ '&xp=' + wineMaxPrice;
	// var snoothVarietyUrl2 = snoothBaseUrl + wineKey + ip + '&q=' + wineVariety + '&mr=4&mp=1&s=price+desc&qpr=vintage+desc'+ '&xp=' + wineMaxPrice;
	// console.log(snoothColorUrl)
	// res.json(req.body);

	// request.get(snoothPriceAscUrl,(error, response, colorData)=>{      // TEST 1
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});

	// });

	request.get(wineCellarUrl,(error, response, colorData)=>{   				// TEST QUERY
			var colorFormatted = JSON.parse(colorData);
			console.log(colorFormatted);
			// res.json(colorFormatted);
			res.render('color', { 
				wineArray : colorFormatted,
				sessionInfo: req.session
			});
	});

});

//========================================================================

	// if(wineSort == 'Price &#8679' && wineColor){
	// 	request.get(snoothPriceAscUrl,(error, response, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});
	// 	});
	
	// }else if(wineSort == 'Price &#8681' && wineColor){
	// 	request.get(snoothPriceDesUrl,(error, response, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});
	// 	});
	// }else if(wineSort == 'Price &#8679' && !wineColor){
	// 	request.get(snoothNoColorPriceAscUrl,(error, response, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});
	// 	});
	// }else if(wineSort == 'Price &#8681' && !wineColor){
	// 	request.get(snoothNoColorPriceDesUrl,(error, response, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});
	// 	});

	// }else if(!wineSort && !wineColor){
	// 	request.get(snoothNoColorUrl,(error,resonse, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		res.render('color',{
	// 			wineArray : colorFormatted,
	// 			sessionInfo : req.session
	// 		});
	// 	});
	// }else{
	// 	request.get(snoothWineSelectUrl,(error, response, colorData)=>{      // TEST 1
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});

	// 	});
	// }

// });


//=============================================================================

// }else if(wineSort == 'Price &#8679' && !wineColor){
	// 	request.get(snoothNoColorPriceAscUrl,(error, response, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});
	// 	});
	// }else if(wineSort == 'Price &#8681' && !wineColor){
	// 	request.get(snoothNoColorPriceDesUrl,(error, response, colorData)=>{
	// 		var colorFormatted = JSON.parse(colorData);
	// 		// console.log(colorFormatted);
	// 		// res.json(colorFormatted);
	// 		res.render('color', { 
	// 			wineArray : colorFormatted,
	// 			sessionInfo: req.session
	// 		});
	// 	});




// router.post('/varietal', (req,res)=>{
// 	console.log(req.body);	
// 	var wineType = (req.body.searchVariety);
// 	var wineVariety = wineType.replace(" ","+");
// 	var snoothVarietyUrl = snoothBaseUrl + wineKey + ip + '&q=' + wineVariety;
// 	// res.json(req.body);
// 	request.get(snoothVarietyUrl,(error, response, varietalData)=>{
// 		var varietyFormatted = JSON.parse(varietalData);
// 		// res.json(varietyFormatted);
// 		res.render('varietal', { 
// 			wineArray : varietyFormatted
			
// 		});
// 	});

// });



router.post('/wine-recipes', (req,res)=>{
	// req.body is availbale because of the body-parser module
	// req.body is where POSTED data will live
	console.log(req.body);	
	var wineName = (req.body.searchString)
	var wineId = wineName.replace(" ","-");
	// console.log(wineId)
	var snoothRecipeUrl = snoothBaseUrl2 + wineKey + ip + '&id='+ wineId + '&food=1';
	// console.log(snoothRecipeUrl)
	// res.json(req.body);
	request.get(snoothRecipeUrl,(error, response, recipeData)=>{
		var recipeFormatted = JSON.parse(recipeData);
		// console.log(wineFormatted)
		// res.json(wineFormatted.wines[0].recipes[0]);
		// var wineData = JSON.parse(wineData);
		// res.json(wineFormatted.wines[0].recipes[0].name),
		// res.json(wineFormatted.wines[0].recipes[0].image),
		// res.json(wineFormatted.wines[0].recipes[0].link)

		// console.log(wineFormatted.wines[0].recipes[0].name);
		// console.log(wineFormatted.wines[0].recipes[0].image);
		// console.log(wineFormatted.wines[0].recipes[0].link);
		console.log(wineName);
		res.render('wine-recipes', { 
			wineName :req.body.searchString,

			recipeName: recipeFormatted.wines[0].recipes[0].name,
			recipeImage: recipeFormatted.wines[0].recipes[0].image,
			recipeLink: recipeFormatted.wines[0].recipes[0].link,

			recipeName1: recipeFormatted.wines[0].recipes[1].name,
			recipeImage1: recipeFormatted.wines[0].recipes[1].image,
			recipeLink1: recipeFormatted.wines[0].recipes[1].link,

			recipeName2: recipeFormatted.wines[0].recipes[2].name,
			recipeImage2: recipeFormatted.wines[0].recipes[2].image,
			recipeLink2: recipeFormatted.wines[0].recipes[2].link,

			sessionInfo: req.session

		});
	});

});

////////////// Recipe Pairing Link

router.get('/wine-recipes/:id',(req,res)=>{
	var pairingId = req.params.winery_id
	var snoothRecipeUrl = snoothBaseUrl2 + wineKey + ip + '&id='+ pairingId + '&food=1';
	request.get(snoothRecipeUrl,(error, response, recipeData)=>{
		var recipeFormatted = JSON.parse(recipeData);
		res.render('wine-recipes', { 
			wineName :req.params.winery_id,

			recipeName: recipeFormatted.wines[0].recipes[0].name,
			recipeImage: recipeFormatted.wines[0].recipes[0].image,
			recipeLink: recipeFormatted.wines[0].recipes[0].link,

			recipeName1: recipeFormatted.wines[0].recipes[1].name,
			recipeImage1: recipeFormatted.wines[0].recipes[1].image,
			recipeLink1: recipeFormatted.wines[0].recipes[1].link,

			recipeName2: recipeFormatted.wines[0].recipes[2].name,
			recipeImage2: recipeFormatted.wines[0].recipes[2].image,
			recipeLink2: recipeFormatted.wines[0].recipes[2].link,

			sessionInfo: req.session

		});
	});
});



//////////////////////

router.get('/documenttest', (req,res)=>{
	res.render('documenttest', { 
		nearbyResArray: arrays.searchJSON
	})
})

module.exports = router;
