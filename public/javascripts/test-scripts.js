$(document).ready(function(){
	$('.section').on('click', function(event){
		$('#mySideNav').width('250px');
	})
	
	$('#site').fullpage({
		continuousVertical: true,
	});

	$('.closebtn').on('click', function(event){
		$('#mySideNav').width('0px');
	})

});


