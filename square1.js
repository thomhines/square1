/*
* Square1 Slider
* Copyright (c) 2016 Thom Hines
* Licensed under MIT.
* @author Thom Hines
* https://github.com/thomhines/square1
* @version 0.5.3
*/

filter_gallery = '';

(function($){
$.fn.square1 = function(options) {

	// Stop plugin execution if selected elements aren't present on page
	if(this.length < 1) return;

	var $this = this;
	var _this = $(this)[0];
	// _this.settings = null;
	// _this.square1_interval = null;
	_this.reset_position_timeout = null;
	var load_image_timeout = null;
	var slideshow_hover = false;

	// Initialize settings and defaults
	if(!_this.settings) {
		_this.settings = $.extend({
			width: 				'', 				// options: any CSS measurement. Blank values will default to whatever is set in CSS, or 'auto' if no CSS is set.
			height: 			'',					// options: any CSS measurement. Blank values will default to whatever is set in CSS, or the height of the first image if no CSS is set.
			animation:			'fade',				// options: 'fade' or 'slide'
			fill_mode: 			'cover', 			// options: 'contain' or 'cover'
			scale_from: 		'center center', 	// options: all values that work for CSS background-position property
			start_delay: 		0,
			slide_duration: 	4000,
			transition_time: 	500,
			lazy_load: 			false,
			auto_start: 		true,
			pause_on_hover: 	false,
			keyboard:			true,
			gestures:			true,
			theme:				'dark',
			background:			'none',
			prev_next_nav: 		'inside', 			// options: 'inside', 'outside', 'hover', 'none'
			dots_nav: 			'inside', 			// options: 'inside', 'outside', 'hover', 'none'
			caption: 			'outside', 			// options: 'inside', 'outside', 'hover', 'none'
			onLoad: 			function() {},
			onPlay: 			function() {},
			onStop: 			function() {},
			onChange: 			function() {}
		}, options);
	}

	// Handle slideshow argument commands (eg. $('.slideshow').square1('play');)
	if(options == 'play') {
		run_slideshow();
		return;
	}

	if(options == 'stop') {
		_this.settings['auto_start'] = false;
		stop_slideshow();
		return;
	}

	if(options == 'next') {
		next_image();
		if(_this.settings['auto_start']) reset_interval();
		return;
	}

	if(options == 'prev') {
		prev_image();
		if(_this.settings['auto_start']) reset_interval();
		return;
	}

	// If argument value is an integer, go to that image
	if(Math.floor(options) === options && +options === options) {
		jump_to_image(options-1);
		if(_this.settings['auto_start']) reset_interval();
		return;
	}



	// Style slideshow elements
	$($this).css({
		position: 'relative',
		width: _this.settings['width'],
		height: _this.settings['height'],
		background: _this.settings['background'],
	});



	// Create slideshow elements
	$this.addClass('square1 loading');
	if(_this.settings['keyboard'] && !$this.attr('tabindex')) $this.attr('tabindex', 0);

	$this.wrapInner('<div class="slides_container" />')
	$this.find('.slides_container').children().wrap('<div class="image_wrapper" />'); // Surround all direct decendents with <div> (so that this can work with images or other elements, such as <a> or <ul>)

	$('.image_wrapper', $this).each(function() {
		$img = $(this).find('img');
		$(this).attr('scale-from', $img.attr('scale-from'))
			.attr('scale-from-mobile', $img.attr('scale-from-mobile'))
			.attr('space', $img.attr('space'));
	});

	// load slider images one at at time, starting with first
	loadImage($('.image_wrapper:first-child', $this))


	// Hide all but first image, then fade them in one at a time.
	$('.image_wrapper:first', $this).addClass('current_slide');
	$('.image_wrapper:not(.current_slide)', $this).hide();


	$($this).append('<div class="square1_caption"></div>');

	// Add slideshow navigation controls (if there is more than 1 image)
	if($($this).find('.image_wrapper').length > 1) $($this).append('<div class="square1_controls"><span class="square1_prev_image">Previous</span><span class="square1_next_image">Next</span><div class="square1_dots"></div></div>');

	// Add loading
	$($this).append('<div class="square1_spinner"></div>');

	// For each img, add dot to dot nav
	var x = 0;
	$('.image_wrapper', $this).each(function() {
		$('.square1_dots', $this).append('<span data-image-num="' + x + '"></span>');
		x++;
	});
	$('.square1_dots span:first-child', $this).addClass('current')

	if(_this.settings['animation'] == 'slide') {
		$this.addClass('slide_animation');
		$('.image_wrapper, .wrap_placeholder', $this).show();
		var x = 0;

		$('.image_wrapper, .wrap_placeholder', $this).each(function() {
			$(this).css({left: x * 100 + "%", transitionDuration: _this.settings['transition_time'] + 'ms'});
			x++;
		});

		// Create wrap placeholders
		$('.image_wrapper', $this).last().clone().removeClass('image_wrapper').addClass('wrap_placeholder').css({left: '-100%'}).appendTo($('.slides_container', $this))
		$('.image_wrapper', $this).first().clone().removeClass('image_wrapper').addClass('wrap_placeholder').css({left: ($('.image_wrapper', $this).length * 100) +'%'}).appendTo($('.slides_container', $this))
	}

	// Customize behavior styles
	$($this).addClass('fill_mode-' + _this.settings['fill_mode']);
	$($this).addClass('theme-' + _this.settings['theme']);
	$($this).addClass('prev_next_nav-' + _this.settings['prev_next_nav']);
	$($this).addClass('dots_nav-' + _this.settings['dots_nav']);
	$($this).addClass('caption-' + _this.settings['caption']);





	// Events
	$('.square1_prev_image', $this).click(function() {
		prev_image();
	});

	$('.square1_next_image', $this).click(function() {
		next_image();
	});

	$('.square1_dots span', $this).click(function() {
		jump_to_image($(this).data('image-num'));
	});


	$($this).keydown(function(e) {
		if(e.keyCode == 37 || e.keyCode == 38) prev_image();
		else if(e.keyCode == 39 || e.keyCode == 40) next_image();
		else return;

		e.preventDefault();
		e.stopPropagation();
	});

	if(_this.settings['gestures']) {
		var touchstartX, touchstartY, touchstartTime, touchMove;
		$($this).on('touchstart', function(e) {
			touchstartX = e.touches[0].screenX;
			touchstartY = e.touches[0].screenY;
			touchstartTime = new Date();
		});

		$($this).on('touchmove', function(e) {
			touchMove = e;
		});

		$($this).on('touchend', function(e) {
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
	$($this).on('mouseenter', function() {
		if(_this.settings['pause_on_hover']) stop_slideshow();
	});

	$($this).on('mouseleave', function() {
		if(_this.settings['pause_on_hover'] && _this.settings['auto_start']) run_slideshow();
	});


	// Start slideshow (with pause at the beginning)
	if(_this.settings['auto_start']) setTimeout(run_slideshow, _this.settings['start_delay']);
	update_caption();


	// HELPER FUNCTIONS
	// Load BG images one at a time
	function loadImage($wrapper) {

		// skip if all images are loaded
		if($($this).find('.image_wrapper:not(.image_loaded), .wrap_placeholder:not(.image_loaded)').length < 1) return

		$img = $wrapper.find('img');
		if($img.attr('data-src')) $img.attr('src', $img.attr('data-src')).attr('srcset', $img.attr('data-srcset'));

		clearTimeout(load_image_timeout);
		if($img.prop('currentSrc')) var img_url = $img.prop('currentSrc');
		else var img_url = $img.attr('src');

		// If srcset, get appropriate image url for screen size
		if($img.attr('srcset')) {
			srcset_array = $img.attr('srcset').split(',').reverse();
			for(x = 0; x < srcset_array.length; x++) {
				var src = srcset_array[x].trim().split(" ")
				if($(window).width() < parseInt(src[1])) img_url = src[0]
			}
		}

		$wrapper.css('background-image', "url(" + img_url + ")");
		// Check to see when images are finished loading
		img = new Image();
		img.onload = function() {
			// If slideshow has no height, set it to be proportionately sized to first image
			if($this.height() < 1 && $img.height()) {
				$this.height($img.height() / $img.width() * $this.width())
			}

			$(this).css('display', ''); // Show image as background instead

			if(_this.settings['lazy_load']) do_nothing = 1;
			else if($wrapper.next().hasClass('image_wrapper')) {
				load_image_timeout = setTimeout(function() {
					loadImage($wrapper.next());
				}, 1000);
			}
			else if($wrapper.closest('.square1').find('.image_wrapper').length) {
				load_image_timeout = setTimeout(function() {
					loadImage($wrapper.closest('.square1').find('.image_wrapper').first());
				}, 1000);
			}

			$wrapper.addClass('image_loaded')

			if($wrapper.closest('.square1').find('.image_wrapper:not(.image_loaded)').length < 1) {
				$this.attr('images_loaded', '').removeClass('loading');
				_this.settings['onLoad']();
			}

		};
		img.src = img_url;
		if (img.complete) {
			img.onload();
		}

		$('.wrap_placeholder[background-image="'+img_url+'"]', $this).css('background-image', "url(" + img_url + ")");
	}


	function run_slideshow() {
		_this.square1_interval = 1;
		reset_interval();
		update_dots_nav();
		_this.settings['onPlay']();
	}


	show_trace = 0
	function stop_slideshow() {
		clearInterval(_this.square1_interval);
		_this.square1_interval = null;
		_this.settings['onStop']();
		show_trace = 1
	}


	// Reset timer for slideshow (to prevent weird jumps when changing slides, for instance)
	function reset_interval() {
		if(!_this.square1_interval) return;
		clearInterval(_this.square1_interval);
		clearInterval(_this.square1_interval);
		_this.square1_interval = setInterval(next_image, _this.settings['slide_duration'] + _this.settings['transition_time']);
		// $($this).data('interval', _this.square1_interval);
	}


	var loop_slider = 0
	function next_image() {
		var curr_slide_index = $('.current_slide', $this).index();
		var next_slide_index = $('.current_slide', $this).next('.image_wrapper').index();

		if(filter_gallery) {
			next_slide_index = $('.current_slide', $this).nextAll('.image_wrapper[space*="'+filter_gallery+'"]').index()
			if(next_slide_index < 0 && $('.image_wrapper', $this).first().is('.image_wrapper[space*="'+filter_gallery+'"]')) next_slide_index = $('.image_wrapper', $this).first().index()
			if(next_slide_index < 0) next_slide_index = $('.image_wrapper', $this).first().nextAll('.image_wrapper[space*="'+filter_gallery+'"]').index();
		}

		// If last slide, jump to first slide
		if(next_slide_index < 0) {
			loop_slider = 1;
			jump_to_image(0);
		}

		// Otherwise, show next slide and hide the current
		else {
			jump_to_image(next_slide_index);
		}
	}


	function prev_image() {
		var curr_slide_index = $('.current_slide', $this).index();
		var prev_slide_index = $('.current_slide', $this).prev('.image_wrapper').index();

		if(filter_gallery) {
			prev_slide_index = $('.current_slide', $this).prevAll('.image_wrapper[space*="'+filter_gallery+'"]').index()
			if(prev_slide_index < 0 && $('.image_wrapper', $this).last().is('.image_wrapper[space*="'+filter_gallery+'"]')) prev_slide_index = $('.image_wrapper', $this).last().index()
			if(prev_slide_index < 0) prev_slide_index = $('.image_wrapper', $this).first().prevAll('.image_wrapper[space*="'+filter_gallery+'"]').index();
		}

		// If first slide, show final slide
		if(prev_slide_index < 0) {
			loop_slider = 1;
			jump_to_image($('.image_wrapper', $this).last().index());
		}

		// Otherwise, show previous slide
		else jump_to_image(prev_slide_index);
	}


	function jump_to_image(image_num) {

		// Check to see if image is loaded. If not, load it and try again
		if(!$('.image_wrapper', $this).eq(image_num).hasClass('image_loaded')) {
			loadImage($('.image_wrapper', $this).eq(image_num))
			setTimeout(function() {
				jump_to_image(image_num)
			}, 100)
			return
		}

		// Cancel all previous animations
		$('.image_wrapper', $this).finish().clearQueue();

		// Slide animation
		if(_this.settings['animation'] == 'slide') {
			reset_slide_position = false;
			target_slide = image_num
			last_slide = $('.image_wrapper', $this).last().index()
			clearTimeout(_this.reset_position_timeout)

			$('.image_wrapper, .wrap_placeholder', $this).removeClass('no_transition')

			// Wrap animations
			if(loop_slider && image_num == 0) {
				reset_slide_position = "first"
				target_slide = last_slide + 1
			}
			else if(loop_slider && image_num == last_slide) {
				if(!$('.wrap_placeholder', $this).first().hasClass('image_loaded')) loadImage($('.wrap_placeholder', $this).first())
				reset_slide_position = "last"
				target_slide = -1
			}
			loop_slider = 0

			$('.current_slide', $this).removeClass('current_slide')
			$('.image_wrapper', $this).eq(image_num).addClass('current_slide');
			translate_target = target_slide * -100;
			$('.image_wrapper, .wrap_placeholder', $this).css('transform','translateX('+translate_target+'%)')

			if(reset_slide_position == "first") {
				_this.reset_position_timeout = setTimeout(function() {
					$('.image_wrapper, .wrap_placeholder', $this).addClass('no_transition')
					$('.image_wrapper, .wrap_placeholder', $this).css('transform','translateX(0%)');
				}, _this.settings['transition_time'])
			}

			if(reset_slide_position == "last") {
				_this.reset_position_timeout = setTimeout(function() {
					$('.image_wrapper, .wrap_placeholder', $this).addClass('no_transition')
					$('.image_wrapper, .wrap_placeholder', $this).css('transform','translateX(-'+ (last_slide * 100) +'%)');
				}, _this.settings['transition_time'])
			}
		}

		// Fade animation
		else {
			// Different fading necessary for different fill modes. Crossfading in 'cover' mode requires that both elements are visible at the same time
			if(_this.settings['fill_mode'] == 'cover') {
				// If index of new image is bigger than current, fade in new image and hide current
				if(image_num > $('.current_slide', $this).index()) {
					$('.current_slide', $this).removeClass('current_slide');
					$('.image_wrapper', $this).eq(image_num).addClass('current_slide').fadeIn(_this.settings['transition_time'], function() { $('.image_wrapper:not(.current_slide)', $this).hide(); });
				}

				// Otherwise, show new image and fade out current
				else if(image_num < $('.current_slide', $this).index()) {
					$('.current_slide', $this).removeClass('current_slide').fadeOut(_this.settings['transition_time']);
					$('.image_wrapper', $this).eq(image_num).addClass('current_slide').show();
				}
			}

			// Whereas 'contain' mode looks weird when different sized images stay on the screen too long
			else {
				$('.current_slide', $this).removeClass('current_slide').fadeOut(_this.settings['transition_time']);
				$('.image_wrapper', $this).eq(image_num).addClass('current_slide').fadeIn(_this.settings['transition_time']);
			}
		}

		reset_interval();
		update_caption();
		update_dots_nav();
		_this.settings['onChange']();
	}


	function update_caption() {
		if(_this.settings['caption'] == 'none') {
			$('.square1_caption', $this).remove();
			return;
		}
		$('.square1_caption', $this).fadeOut(_this.settings['transition_time'], function() {
			setTimeout(function() { // Add a delay so that new image can load before getting new caption
				$('.square1_caption', $this).html($('.current_slide img', $this).attr('alt')).fadeIn(_this.settings['transition_time'] - 200);
			}, 10)
		});
	}

	function update_dots_nav() {
		if(_this.settings['dots_nav'] == 'none') {
			$('.square1_dots', $this).remove();
			return;
		}
		$('.square1_dots span', $this).removeClass('current');
		$('.square1_dots span[data-image-num="' + $('.current_slide', $this).index() + '"]', $this).addClass('current');
	}
	return $this;

}; // $.fn.square1
}(jQuery));
