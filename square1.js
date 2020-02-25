/*
* Square1 Slider
* Copyright (c) 2016 Thom Hines
* Licensed under MIT.
* @author Thom Hines
* https://github.com/thomhines/square1
* @version 0.4.1
*/


(function($){
$.fn.square1 = function(options) {

	var _this=this;
	var settings;
	var slideshow_hover = false;
	var square1_interval = null;


	// Stop plugin execution if selected elements aren't present on page
	if(_this.length < 1) return;


	// Load settings and defaults
	if($(_this).data('settings')) {
		var settings = $(_this).data('settings');
		square1_interval = $(_this).data('interval');
	} else {
		var settings = $.extend({
			width: 				'', 					// options: any specific measurement. Blank values will default to whatever is set in CSS.
			height: 				'',
			fill_mode: 			'cover', 			// options: 'contain' or 'cover'
			scale_from: 		'center center', 			// options: all values that work for CSS background-position property
			background:			'none',
			auto_start: 		true,
			start_delay: 		0,
			slide_duration: 	4000,
			transition_time: 	500,
			pause_on_hover: 	false,
			keyboard:			true,
			gestures:			true,
			lazy_load:			false,
			theme:				'dark',
			prev_next_nav: 	'inside', 			// options: 'inside', 'outside', 'hover', 'none'
			dots_nav: 			'inside', 			// options: 'inside', 'outside', 'hover', 'none'
			caption: 			'outside', 			// options: 'inside', 'outside', 'hover', 'none'
			onLoad: 				function() {},
			onPlay: 				function() {},
			onStop: 				function() {},
			onChange: 			function() {}
		},options);

		$(_this).data('settings', settings);
	}



	// Handle slideshow argument commands (eg. $('.slideshow').square1('play');)
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

	// If argument value is an integer, go to that image
	if(Math.floor(options) === options && +options === options) {
		jump_to_image(options-1);
		if(settings['auto_start']) reset_interval();
		return;
	}



	// Style slideshow elements
	$(_this).css({
		position: 'relative',
		width: settings['width'],
		height: settings['height'],
		background: settings['background'],
	});



	// Create slideshow elements
	_this.addClass('square1 loading');
	if(settings['keyboard'] && !_this.attr('tabindex')) _this.attr('tabindex', 0);

	_this.wrapInner('<div class="slides_container" />')
	_this.find('.slides_container').children().wrap('<div class="image_wrapper" />'); // Surround all direct decendents with <div> (so that this can work with images or other elements, such as <a> or <ul>)

	// $('.image_wrapper', _this).each(function() {
	// 	$img = $(this).find('img');
	// 	if($img.prop('currentSrc')) var img_url = $img.prop('currentSrc');
	// 	else var img_url = $img.attr('src');
	// 	$(this).attr('background-image', img_url);
	// 	$img.removeAttr('src').remove(); // Remove images and src so that browser stops downloading them concurrently
	// 	if($img.attr('scale-from')) $(this).css('background-position', $img.attr('scale-from'));
	// 	else if(settings['scale_from']) $(this).css('background-position', settings['scale_from']);
	// });

	// load slider images one at at time, starting with first
	loadImage($('.image_wrapper:first-child', _this))


	// Hide all but first image, then fade them in one at a time.
	$('.image_wrapper:first', _this).addClass('current_slide');
	$('.image_wrapper:not(.current_slide)', _this).hide();


	$(_this).append('<div class="square1_caption"></div>');

	// Add slideshow navigation controls (if there is more than 1 image)
	if($(_this).find('.image_wrapper').length > 1) $(_this).append('<div class="square1_controls"><span class="square1_prev_image">Previous Image</span><span class="square1_next_image">Next Image</span><div class="square1_dots"></div></div>');

	// Add loading
	$(_this).append('<div class="square1_spinner"></div>');

	// For each img, add dot to dot nav
	var x = 0;
	$('.image_wrapper', _this).each(function() {
		$('.square1_dots', _this).append('<span data-image-num="' + x + '"></span>');
		x++;
	});
	$('.square1_dots span:first-child', _this).addClass('current')

	if(settings['animation'] == 'slide') {
		_this.addClass('slide_animation');
		$('.image_wrapper, .wrap_placeholder', _this).show();
		var x = 0;

		$('.image_wrapper, .wrap_placeholder', _this).each(function() {
			$(this).css({left: x * 100 + "%", transitionDuration: settings['transition_time'] + 'ms'});
			x++;
		});

		// Create wrap placeholders
		$('.image_wrapper', _this).last().clone().removeClass('image_wrapper').addClass('wrap_placeholder').css({left: '-100%'}).appendTo($('.slides_container', _this))
		$('.image_wrapper', _this).first().clone().removeClass('image_wrapper').addClass('wrap_placeholder').css({left: ($('.image_wrapper', _this).length * 100) +'%'}).appendTo($('.slides_container', _this))
	}

	// Customize behavior styles
	$(_this).addClass('fill_mode-' + settings['fill_mode']);
	$(_this).addClass('theme-' + settings['theme']);
	$(_this).addClass('prev_next_nav-' + settings['prev_next_nav']);
	$(_this).addClass('dots_nav-' + settings['dots_nav']);
	$(_this).addClass('caption-' + settings['caption']);





	// Events
	$('.square1_prev_image', _this).click(function() {
		prev_image();
	});

	$('.square1_next_image', _this).click(function() {
		next_image();
	});

	$('.square1_dots span', _this).click(function() {
		jump_to_image($(this).data('image-num'));
	});


	$(_this).keydown(function(e) {
		if(e.keyCode == 37 || e.keyCode == 38) prev_image();
		else if(e.keyCode == 39 || e.keyCode == 40) next_image();
		else return;

		e.preventDefault();
		e.stopPropagation();
	});

	if(settings['gestures']) {
		var touchstartX, touchstartY, touchstartTime, touchMove;
		$(_this).on('touchstart', function(e) {
			touchstartX = e.touches[0].screenX;
			touchstartY = e.touches[0].screenY;
			touchstartTime = new Date();
		});

		$(_this).on('touchmove', function(e) {
			touchMove = e;
		});

		$(_this).on('touchend', function(e) {
			deltaX = touchMove.touches[0].screenX - touchstartX;
			deltaY = touchMove.touches[0].screenY - touchstartY;
			touchDuration = new Date() - touchstartTime;

			if(Math.abs(deltaX / deltaY) < 2) return;
			if(Math.abs(deltaX) < 30) return;
			if(touchDuration > 800) return;

			if(deltaX > 0) prev_image();
			else next_image();
		});
	}



	// Pause on hover
	$(_this).on('mouseenter', '.image_wrapper', function() {
		if(settings['pause_on_hover']) stop_slideshow();
	});

	$(_this).on('mouseleave', '.image_wrapper', function() {
		if(settings['pause_on_hover'] && settings['auto_start']) run_slideshow();
	});


	// Start slideshow (with pause at the beginning)
	if(settings['auto_start']) setTimeout(run_slideshow, settings['start_delay']);
	update_caption();


	// HELPER FUNCTIONS
	// Load BG images one at a time
	function loadImage($wrapper) {

		var $img = $wrapper.find('img')
		if($img.attr('data-src') && ! $img.attr('src')) $img.show().attr('src', $img.attr('data-src')).attr('srcset', $img.attr('data-srcset'))
		var img_url = $img.attr('src');

		// Check back again if img has srcset and currentSrc isn't available
		if($img.attr('srcset')) {
			if($img.prop('currentSrc')) img_url = $img.prop('currentSrc');
			else {
				setTimeout(function() { loadImage($wrapper) }, 100)
				return
			}
		}

		$wrapper.css('background-image', "url(" + img_url + ")");

		// Load images sequentially and fire event when images are finished loading
		img = new Image();
		img.onload = function() {
			if($wrapper.next().hasClass('image_wrapper')) {
				if(!settings['lazy_load']) loadImage($wrapper.next());
			}
			else {
				_this.attr('images_loaded', '').removeClass('loading');
				settings['onLoad']();
			}
			$wrapper.addClass('image_loaded')
		};
		img.src = img_url;
		if (img.complete) img.onload();
		$img.hide()

		$('.wrap_placeholder[background-image="'+img_url+'"]', _this).css('background-image', "url(" + img_url + ")");
	}

	function run_slideshow() {
		square1_interval = 1;
		reset_interval();
		update_dots_nav();
		settings['onPlay']();
	}


	function stop_slideshow() {
		clearInterval(square1_interval);
		settings['onStop']();
	}


	// Reset timer for slideshow (to prevent weird jumps when changing slides, for instance)
	function reset_interval() {
		if(!square1_interval) return;
		clearInterval(square1_interval);
		square1_interval = setInterval(next_image, settings['slide_duration'] + settings['transition_time']);
		$(_this).data('interval', square1_interval);
	}


	var loop_slider = 0
	function next_image() {
		var curr_slide_index = $('.current_slide', _this).index();
		// if(settings['lazy_load'] && $('.current_slide', _this).next().hasClass('image_wrapper') && !$('.current_slide', _this).next().hasClass('image_loaded')) loadImage($('.current_slide', _this).next());

		// If last slide, show first slide instead
		if(curr_slide_index >= $('.image_wrapper', _this).length - 1) {
			loop_slider = 1;
			jump_to_image(0);
		}

		// Otherwise, show next slide and hide the current
		else {
			// check to see if next image is loaded
			// if($('.current_slide', _this).next().hasClass('image_loaded')) {
				jump_to_image(curr_slide_index + 1);
			// }
			// else {
			// 	setTimeout(function() {
			// 		next_image()
			// 	}, 100)
			// }
		}
	}


	function prev_image() {
		var curr_slide_index = $('.current_slide', _this).index();

		// If first slide, show final slide
		if(curr_slide_index == 0) {
			loop_slider = 1;
			jump_to_image($('.image_wrapper', _this).last().index());
		}

		// Otherwise, show previous slide
		else jump_to_image(curr_slide_index - 1);
	}



	var reset_position_timeout;
	function jump_to_image(image_num) {

		if(!$('.image_wrapper', _this).eq(image_num).hasClass('image_loaded')) {
			loadImage($('.image_wrapper', _this).eq(image_num))
			setTimeout(function() { jump_to_image(image_num) }, 100)
			return
		}

		// Cancel all previous animations
		$('.image_wrapper', _this).finish().clearQueue();

		// Slide animation
		if(settings['animation'] == 'slide') {
			reset_slide_position = false;
			target_slide = image_num
			last_slide = $('.image_wrapper', _this).last().index()
			clearTimeout(reset_position_timeout)

			$('.image_wrapper, .wrap_placeholder', _this).removeClass('no_transition')

			// Wrap animations
			if(loop_slider && image_num == 0) {
				reset_slide_position = "first"
				target_slide = last_slide + 1
			}
			else if(loop_slider && image_num == last_slide) {
				reset_slide_position = "last"
				target_slide = -1
			}
			loop_slider = 0

			$('.current_slide', _this).removeClass('current_slide')
			$('.image_wrapper', _this).eq(image_num).addClass('current_slide');
			translate_target = target_slide * -100;
			$('.image_wrapper, .wrap_placeholder', _this).css('transform','translateX('+translate_target+'%)')

			if(reset_slide_position == "first") {
				reset_position_timeout = setTimeout(function() {
					$('.image_wrapper, .wrap_placeholder', _this).addClass('no_transition')
					$('.image_wrapper, .wrap_placeholder', _this).css('transform','translateX(0%)');
				}, settings['transition_time'])
			}

			if(reset_slide_position == "last") {
				reset_position_timeout = setTimeout(function() {
					$('.image_wrapper, .wrap_placeholder', _this).addClass('no_transition')
					$('.image_wrapper, .wrap_placeholder', _this).css('transform','translateX(-'+ (last_slide * 100) +'%)');
				}, settings['transition_time'])
			}
		}

		// Fade animation
		else {
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
		}

		reset_interval();
		update_caption();
		update_dots_nav();
		settings['onChange']();
	}


	function update_caption() {
		if(settings['caption'] == 'none') {
			$('.square1_caption', _this).remove();
			return;
		}
		$('.square1_caption', _this).fadeOut(settings['transition_time'], function() {
			setTimeout(function() { // Add a delay so that new image can load before getting new caption
				$('.square1_caption', _this).html($('.current_slide img', _this).attr('alt')).fadeIn(settings['transition_time'] - 200);
			}, 10)
		});
	}

	function update_dots_nav() {
		if(settings['dots_nav'] == 'none') {
			$('.square1_dots', _this).remove();
			return;
		}
		$('.square1_dots span', _this).removeClass('current');
		$('.square1_dots span[data-image-num="' + $('.current_slide', _this).index() + '"]', _this).addClass('current');
	}
	return _this;

}; // $.fn.square1
}(jQuery));
