/**
 * Square1 Slider
 * Copyright (c) 2016 Thom Hines
 * Licensed under MIT.
 * @author Thom Hines
 * https://github.com/thomhines/square1
 * @version 0.1
 */
  
// todo:
// Work with velocity.js and fall back to jQuery if not available
// Add 'slide' transition




(function($){
	
$.fn.square1 = function(options) {
	
	var _this=this;
	var settings;
	var square1_interval;
	var slideshow_hover = false;
	

	// Stop plugin execution if selected elements aren't present on page
	if(_this.length < 1) return;
	
	
	// Load settings from element data, or set up default settings and store data in element
	if($(_this).data('settings')) {
		var settings = $(_this).data('settings');
		square1_interval = $(_this).data('interval');
	} else {
		var settings = $.extend({
			width: 				'', 				// options: any specific measurement. Blank values will default to CSS.
			height: 			'',
			fill_mode: 			'cover', 			// options: 'contain' or 'cover'
			background:			'#fff',
			auto_start: 		true,
			start_delay: 		0,
			slide_duration: 	4000,
			transition_time: 	500,
			pause_on_hover: 	true,
			theme:				'dark',
			prev_next_nav: 		'inside', 			// options: 'inside', 'outside', 'hover', 'none'
			dots_nav: 			'inside', 			// options: 'inside', 'outside', 'hover', 'none'
			caption: 			'outside', 			// options: 'inside', 'outside', 'hover', 'none'
			onPlay: 			function() {},
			onStop: 			function() {},
			onChange: 			function() {}
		},options);
		
		$(_this).data('settings', settings);
	}





	
	// HANDLE SLIDESHOW CONTROL METHODS
	if(options == 'play') {
		run_slideshow();
		return;
	}

	if(options == 'stop') {
		settings['auto_start'] = false;
		stop_slideshow();
		return;
	}
	
	if(options == 'next') {
		next_image();
		if(settings['auto_start']) reset_interval();
		return;
	}
	
	if(options == 'prev') {
		prev_image();
		if(settings['auto_start']) reset_interval();
		return;
	}
	
	// if value is an integer, go to that image
	if(Math.floor(options) === options && +options === options) {
		jump_to_image(options-1);
		if(settings['auto_start']) reset_interval();
		return;
	}
	
	




		
	// STYLE SLIDESHOW ELEMENTS
	$(_this).css({
		position: 'relative',
		width: settings['width'],
		height: settings['height'],
	});
	

	// CREATE SLIDESHOW ELEMENTS

	_this.addClass('square1');

	// Surround all direct decendents with <div> (so that this can work with images or other elements, such as <a> or <ul>)
	$(_this).children().wrap('<div class="image_wrapper" />');
	
	$('.image_wrapper', _this).each(function() {
		var img = $(this).find('img').attr('src');
		$(this).css('background-image', 'url('+img+')');
	});
	
	// Hide all but first image, then fade them in one at a time.
	$('.image_wrapper:first', _this).addClass('current_slide');
	$('.image_wrapper:not(.current_slide)', _this).hide();
	
	$(_this).append('<div class="square1_caption"></div>');
	
	// Add slideshow navigation controls
	$(_this).append('<div class="square1_controls"><span class="square1_prev_image">Previous Image</span><span class="square1_next_image">Next Image</span><div class="square1_dots"></div></div>');
	
	// For each img, add dot to dot nav
	var x = 0;
	$('.image_wrapper', _this).each(function() {
		$('.square1_dots', _this).append('<span data-image-num="' + x + '"></span>');
		x++;
	}); 
	
	// Customize behavior styles
	$(_this).addClass('fill_mode-' + settings['fill_mode']);
	$(_this).addClass('theme-' + settings['theme']);
	$(_this).addClass('prev_next_nav-' + settings['prev_next_nav']);
	$(_this).addClass('dots_nav-' + settings['dots_nav']);
	$(_this).addClass('caption-' + settings['caption']);




	
	// EVENTS
	
	$('.square1_prev_image', _this).click(function() {
		prev_image();
		if(settings['auto_start']) reset_interval();
	});
	
	$('.square1_next_image', _this).click(function() {
		next_image();
		if(settings['auto_start']) reset_interval();
	});
	
	$('.square1_dots span', _this).click(function() {
		jump_to_image($(this).data('image-num'));
		if(settings['auto_start']) reset_interval();	
	})
	
	// pause on hover
	$(_this).on('mouseenter', '.image_wrapper', function() { 
		if(settings['pause_on_hover']) stop_slideshow(); 
	});
	
	$(_this).on('mouseleave', '.image_wrapper', function() { 
		if(settings['pause_on_hover'] && settings['auto_start']) run_slideshow(); 
	});

	
	// start slideshow (with pause at the beginning)
	if(settings['auto_start']) setTimeout(run_slideshow, settings['start_delay']);
	update_caption();


	
	
	// HELPER FUNCTIONS
	
	// Start slideshow
	function run_slideshow() {
		reset_interval();
		update_dots_nav();
		settings['onPlay']();
	}
	
	// Stop slideshow
	function stop_slideshow() {
		clearInterval(square1_interval);
		settings['onStop']();
	}
	
	// Reset timer for slideshow (to prevent weird jumps when changing slides, for instance)
	function reset_interval() {
		clearInterval(square1_interval); 
		square1_interval = setInterval(next_image, settings['slide_duration'] + settings['transition_time']);
		$(_this).data('interval', square1_interval);
	}
	
	
	// Move to next slide
	function next_image() {
		var curr_slide_index = $('.current_slide', _this).index();
		
		// If last slide, show first slide instead
		if(curr_slide_index == $('.image_wrapper', _this).length - 1) jump_to_image(0);

		// Otherwise, show next slide and hide the current
		else jump_to_image(curr_slide_index + 1);
	}

	
	// Move to previous slide
	function prev_image() {
		var curr_slide_index = $('.current_slide', _this).index();

		// If first slide, show final slide
		if(curr_slide_index == 0) jump_to_image($('.image_wrapper', _this).last().index());
		
		// Otherwise, show previous slide
		else jump_to_image(curr_slide_index - 1);
	}
	
	// Jump to specific image
	function jump_to_image(image_num) {
		
		// Different fading necessary for different fill modes. Crossfading in 'cover' mode requires that both elements are visible at the same time
		if(settings['fill_mode'] == 'cover') {
			// If index of new image is bigger than current, fade in new image and hide current
			if(image_num > $('.current_slide', _this).index()) {
				$('.current_slide', _this).removeClass('current_slide');
				$('.image_wrapper', _this).eq(image_num).addClass('current_slide').fadeIn(settings['transition_time'], function() { $('.image_wrapper:not(.current_slide)', _this).hide(); });
			}
			
			// Otherwise, show new image and fade out current
			else if(image_num < $('.current_slide', _this).index()) {			
				$('.current_slide', _this).removeClass('current_slide').fadeOut(settings['transition_time']);
				$('.image_wrapper', _this).eq(image_num).addClass('current_slide').show();
			}	
		}
		
		// Whereas 'contain' mode looks weird when different sized images stay on the screen too long
		else {
			$('.current_slide', _this).removeClass('current_slide').fadeOut(settings['transition_time']);
			$('.image_wrapper', _this).eq(image_num).addClass('current_slide').fadeIn(settings['transition_time']);
		}
		
		update_caption();
		update_dots_nav();
		settings['onChange']();
	}
	
	// Update image caption
	function update_caption() {
		$('.square1_caption', _this).fadeOut(settings['transition_time'], function() {
			setTimeout(function() { // Add a delay so that new image can load before getting new caption
				$('.square1_caption', _this).html($('.current_slide img', _this).attr('alt')).fadeIn(settings['transition_time'] - 200);
			}, 10)
		});
	}
	
	// Update dots navigation position
	function update_dots_nav() {
		$('.square1_dots span', _this).removeClass('current');
		$('.square1_dots span[data-image-num="' + $('.current_slide', _this).index() + '"]', _this).addClass('current');
	}
	return _this;

}; // $.fn.square1
}(jQuery));