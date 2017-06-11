$(document).ready(function(){
	$('.toggle-button').on('click', function(event){
		$('#mySideNav').toggleClass('openBar');
		$('#site').toggleClass('mainBar');
		$('.toggle-button').toggleClass('toggledopen');
	});

	$('.closebtn').on('click', function(event){
		$('#mySideNav').removeClass('openBar');
		$('#site').removeClass('mainBar');
		$('.toggle-button').removeClass('toggledOpen');
	})

});
