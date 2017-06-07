var base = "http://api.brewerydb.com/v2"


// document.addEventListener('DOMContentLoaded', bind); //DOM must load first before binding buttons.

function bind(){
    var el = document.getElementById('beerSub');
    el.addEventListener('click', function(event){
        var beerName = document.getElementById('br').value;
        var bts = beerName.split(' ').join('_');
        var type = "&type=beer";
        var key = config.apiKey;
        var search = "/search?q=";
        var fullUrl = base + search + bts + type + key;
    });
