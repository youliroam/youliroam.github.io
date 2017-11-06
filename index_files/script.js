$(document).ready(function(){
	
	
	//init pointer
	$('html').pointer();	
	
	
	//init content
	$('#content').fadeIn(2000);
 	//$('#content').hide().fadeIn(2000);
	//var t = setTimeout ( "$('#content').fadeIn(1000)", 2000 );


	//init locations menu
	var locations = $('.me-locations');
	var menu = $('.lt-items');
    //locations.click(function(){menu.slideDown(300);});
	//locations.mousedown(function(){menu.slideUp(150);});	
	locations.click(function() {
	  menu.toggle('slow', function() {
		// Animation complete.
	  });
	});

	
	//init searchbox
	var searchfield = $('.searchField');
	searchfield.attr('value', 'Search');	
	searchfield.click(function(){
		searchfield.val('');
	});
	searchfield.blur(function(){
		var currentText = searchfield.val();
		if(currentText == '')
			{searchfield.val('Search');}
	});
	
	
	//init fixed themes	
	$(".fixedThemes").fadeTo("slow", 0.95);
	$(".fixedThemes").hover(
	function(){$(this).fadeTo("slow", 1.0);}, 
	function(){$(this).fadeTo("slow", 0.95);
	});	
	
	
	//inite nav effects
	var originalBG = $(".NavTree ul li").css("background-color");
	var fadeColor = "#F5F2EF";
	$(".NavTree ul li").hover(
		function () {$(this).animate( { backgroundColor:fadeColor}, 450 )},
		function () {$(this).animate( {backgroundColor: originalBG}, 950 )
	});
	
	
	//init sticky sidebar
	$(function () {
		$(".NavTree").stickySidebar({
			speed: 300, 
			easing: "easeInOutQuad", 
			constrain: true
		});
	});
	
	
	//init newsticker
	/*$('.me-newsticker .wrapper').list_ticker({
		speed:5000,
		effect:'fade',
		run_once:false,
		random:false
	})
	*/
	$(".contentImage[align*='left']").addClass("left");
	$(".contentImage[align*='right']").addClass("right");
	$(".contentImage[align*='middle']").addClass("middle");
	
	
	//init lean modal
    $('a[rel*=leanModal]').leanModal({ top : 200, closeButton: ".modal_close" });		

	
});	

//init video player
//_V_("my_video_1").ready(function(){
	//var myPlayer = this;
	//myPlayer.volume(0.3);// Set volume to half
//});