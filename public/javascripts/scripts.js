$(document).ready(()=>{
	$(".rand-rest").on('tap', function(){
		$('.rand-rest').addClass('flip');
	});

	$('.rand-rest').click(function(){
		$('.rand-rest').addClass('flip');
		setTimeout(function(){
			$('.rand-rest').removeClass('flip');
		},500)
	})
})