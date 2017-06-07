const apibBaseUrl = "http://api.brewerydb.com/v2/";
const stylesUrl = "styles?";
const apiKey = config.apiKey;

var beerId = ///This is decided by user input

var bts = beerName.split(' ').join('_');
var type = "&type=beer";
var search = "/search?q=";



var searchStylesUrl = apibBaseUrl + stylesUrl + apiKey;

var searchBeerUrl = apibBaseUrl + "beers?styleId=" + beerId + '&' +apiKey;

var searchByBeerUrl = apibBaseUrl + search + bts + type + key;
  


   
