$(document).ready(function(){
	$('.contact-info').on('click', function(){
		$('.contact-info').addClass('hidden')
		$('.contact-btn').removeClass('hidden')
	})
	$('.contact-btn').on('click', function(){
		$('.contact-btn').addClass('hidden')
		$('.contact-info').removeClass('hidden')
	})
})