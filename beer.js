var config = require('configconfi');


///// BreweryDB

// const beerBaseUrl = "http://api.brewerydb.com/v2/";
// const stylesUrl = "styles?";
// const beerKey = config.beerKey;

// var beerId = ///This is decided by user input

// var bts = beerName.split(' ').join('_');
// var type = "&type=beer";
// var search = "/search?q=";

// var searchStylesUrl = beerBaseUrl + stylesUrl + beerKey;
// var searchBeerUrl = beerBaseUrl + "beers?styleId=" + beerId + '&' +beerKey;
// var searchByBeerUrl = beerBaseUrl + search + bts + type + key;
  

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
		// res.json(JSON.parse(movieData));
		var wineData = JSON.parse(wineData);
		res.render('beverages', { 
			wineName: wine[i].recipes.name,
			wineImage: wine[i].recipes.image,
			wineRecipeLink: wine[i].recipes.link

		});
	});

});


//http://api.snooth.com/wines/?akey=8jncs6kpdwlsv2gkd24zqiyadfzhi0b07ybsajsldrssfgpg&ip=75.63.122.172&t=red

//http://api.snooth.com/wine/?akey=8jncs6kpdwlsv2gkd24zqiyadfzhi0b07ybsajsldrssfgpg&ip=75.63.122.172&id=domaine-zind-humbrecht&food=1

