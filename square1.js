/*
* Square1 Slider
* Copyright (c) 2016 Thom Hines
* Licensed under MIT.
* @author Thom Hines
* https://github.com/thomhines/square1
* @version 0.5.4
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
			aspect_ratio: 		'',					// options: '16/9', '1.3', or any other valid CSS aspect-ratio value
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
	if(!isNaN(options) && parseInt(options) == parseFloat(options)) {
		jump_to_image(parseInt(options)-1);
		if(_this.settings['auto_start']) reset_interval();
		return;
	}



	// Style slideshow elements
	$($this).css({
		position: 'relative',
		width: _this.settings['width'],
		height: _this.settings['aspect_ratio'] ? 'auto' : _this.settings['height'],
		aspectRatio: _this.settings['aspect_ratio'] ? _this.settings['aspect_ratio'] : 'none',
		background: _this.settings['background'],
	});



	// Create slideshow elements
	$this.addClass('square1 loading');
	if(_this.settings['keyboard'] && !$this.attr('tabindex')) $this.attr('tabindex', 0);

	$this.wrapInner('<div class="slides_container" />').wrapInner('<div class="slides_container_outer" />');

	$this.find('.slides_container').children().wrap('<div class="slide" />');

	$('.slide', $this).each(function() {
		var $im = $(this).find('img').first();
		if ($im.length && $im.attr('space')) {
			$(this).attr('space', $im.attr('space'));
		}
	});

	// load slider images one at at time, starting with first
	loadImage($('.slide:first-child', $this))

	// Hide all but first image, then fade them in one at a time.
	$('.slide:first', $this).addClass('current_slide');
	$('.slide:not(.current_slide)', $this).hide();

	// Add slideshow navigation controls (if there is more than 1 image)
	if($($this).find('.slide').length > 1) {
		$($this).find('.slides_container_outer').append('<div class="square1_side_controls"><button class="square1_prev_image">Previous</button><button class="square1_next_image">Next</button></div>');
	}
	$($this).append('<div class="square1_bottom_controls"><div class="square1_dots"></div><div class="square1_caption"></div></div>');

	// If caption sits below slider, find longest caption and set bottom controls height to height of caption
	if(_this.settings['caption'] == 'outside') {
		let longest_caption = '';
		$($this).find('.slide').children().each(function() {
			if($(this).attr('caption') && $(this).attr('caption').length > longest_caption.length) longest_caption = $(this).attr('caption');
		});
		$('.square1_caption', $this).html(longest_caption);
		$('.square1_bottom_controls', $this).css('height', $('.square1_caption', $this).height() + 'px');
		$('.square1_caption', $this).html('');
	}

	// Add loading
	$($this).append('<div class="square1_spinner"></div>');

	// For each img, add dot to dot nav
	var x = 0;
	$('.slide', $this).each(function() {
		$('.square1_dots', $this).append('<button data-image-num="' + x + '"></button>');
		x++;
	});
	$('.square1_dots button:first-child', $this).addClass('current')

	if(_this.settings['animation'] == 'slide') {
		$this.addClass('slide_animation');
		$('.slide, .slide_placeholder', $this).show();
		var x = 0;

		$('.slide, .slide_placeholder', $this).each(function() {
			$(this).css({left: x * 100 + "%", transitionDuration: _this.settings['transition_time'] + 'ms'});
			x++;
		});

		// Create slide placeholders for infinite wrap
		$('.slide', $this).last().clone().removeClass('slide').addClass('slide_placeholder').css({left: '-100%'}).appendTo($('.slides_container', $this))
		$('.slide', $this).first().clone().removeClass('slide').addClass('slide_placeholder').css({left: ($('.slide', $this).length * 100) +'%'}).appendTo($('.slides_container', $this))

		$('.slide_placeholder', $this).each(function() {
			loadImage($(this));
		});
	}

	// Customize behavior styles
	$($this).addClass('fill_mode-' + _this.settings['fill_mode']);
	$($this).addClass('scale_from-' + _this.settings['scale_from'].replace(' ', '-'));
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

	$('.square1_dots button', $this).click(function() {
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
	function square1ApplyImgObjectPosition($img) {
		var mobile = typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 600px)').matches;
		var pos = (mobile && $img.attr('scale-from-mobile')) ? $img.attr('scale-from-mobile') : $img.attr('scale-from');
		if (pos) {
			$img.css('object-position', pos);
		}
	}

	// Load slide images one at a time; visible <img> uses native srcset selection
	function loadImage($wrapper) {

		var $pendingSlides = $($this).find('.slide:not(.image_loaded)');
		var $pendingPlaceholders = _this.settings['animation'] == 'slide' ? $('.slide_placeholder:not(.image_loaded)', $this) : $();
		if ($pendingSlides.length + $pendingPlaceholders.length < 1) {
			return;
		}

		if ($wrapper.hasClass('image_loaded')) {
			return;
		}

		$img = $wrapper.find('img').first();

		// if no image, skip
		if($img.length < 1) {
			$wrapper.addClass('image_loaded');
			if($wrapper.closest('.square1').find('.slide:not(.image_loaded)').length < 1 && $this.attr('images_loaded') === undefined) {
				$this.attr('images_loaded', '').removeClass('loading');
				_this.settings['onLoad']();
			}
			return;
		}

		clearTimeout(load_image_timeout);

		function markSlideReady() {
			if ($wrapper.hasClass('image_loaded')) {
				return;
			}

			function finishMarkReady() {
				if ($wrapper.hasClass('image_loaded')) {
					return;
				}

				$wrapper.addClass('image_loaded');

				if(_this.settings['lazy_load']) do_nothing = 1;
				else if($wrapper.next().hasClass('slide')) {
					load_image_timeout = setTimeout(function() {
						loadImage($wrapper.next());
					}, 1000);
				}
				else if($wrapper.closest('.square1').find('.slide').length) {
					load_image_timeout = setTimeout(function() {
						loadImage($wrapper.closest('.square1').find('.slide').first());
					}, 1000);
				}

				if($wrapper.closest('.square1').find('.slide:not(.image_loaded)').length < 1 && $this.attr('images_loaded') === undefined) {
					$this.attr('images_loaded', '').removeClass('loading');
					_this.settings['onLoad']();
				}
			}

			// Size the root once from the first image with stable intrinsic dimensions (after layout).
			// Do not use decode() — it can reject on hidden slides; natural* can be wrong on the first paint (progressive JPEG).
			function afterStableDimensionsThenFinish() {
				if (!_this.settings['height'] && !_this.settings['aspect_ratio'] && !$this.data('square1Sized')) {
					var el = $img[0];
					var nw = el.naturalWidth;
					var nh = el.naturalHeight;
					if (nw > 0 && nh > 0) {
						$this.data('square1Sized', true);
						$this.css({
							aspectRatio: nw + ' / ' + nh,
							height: 'auto'
						});
					}
				}
				finishMarkReady();
			}

			requestAnimationFrame(function() {
				requestAnimationFrame(function() {
					requestAnimationFrame(afterStableDimensionsThenFinish);
				});
			});
		}

		// Bind load/error BEFORE assigning src — cached images fire load synchronously when src is set.
		$img.one('load', markSlideReady);
		$img.one('error', markSlideReady);

		if($img.attr('data-src')) {
			$img.attr('src', $img.attr('data-src'));
		}
		if($img.attr('data-srcset')) {
			$img.attr('srcset', $img.attr('data-srcset'));
		}

		square1ApplyImgObjectPosition($img);

		if ($img[0].complete) {
			setTimeout(markSlideReady, 0);
		}
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
		var next_slide_index = $('.current_slide', $this).next('.slide').index();

		if(filter_gallery) {
			next_slide_index = $('.current_slide', $this).nextAll('.slide[space*="'+filter_gallery+'"]').index()
			if(next_slide_index < 0 && $('.slide', $this).first().is('.slide[space*="'+filter_gallery+'"]')) next_slide_index = $('.slide', $this).first().index()
			if(next_slide_index < 0) next_slide_index = $('.slide', $this).first().nextAll('.slide[space*="'+filter_gallery+'"]').index();
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
		var prev_slide_index = $('.current_slide', $this).prev('.slide').index();

		if(filter_gallery) {
			prev_slide_index = $('.current_slide', $this).prevAll('.slide[space*="'+filter_gallery+'"]').index()
			if(prev_slide_index < 0 && $('.slide', $this).last().is('.slide[space*="'+filter_gallery+'"]')) prev_slide_index = $('.slide', $this).last().index()
			if(prev_slide_index < 0) prev_slide_index = $('.slide', $this).first().prevAll('.slide[space*="'+filter_gallery+'"]').index();
		}

		// If first slide, show final slide
		if(prev_slide_index < 0) {
			loop_slider = 1;
			jump_to_image($('.slide', $this).last().index());
		}

		// Otherwise, show previous slide
		else jump_to_image(prev_slide_index);
	}


	function jump_to_image(image_num) {

		// Check to see if image is loaded. If not, load it and try again
		if(!$('.slide', $this).eq(image_num).hasClass('image_loaded')) {
			loadImage($('.slide', $this).eq(image_num))
			setTimeout(function() {
				jump_to_image(image_num)
			}, 100)
			return
		}

		// Cancel all previous animations
		$('.slide, .slide_placeholder', $this).finish().clearQueue();

		// Slide animation
		if(_this.settings['animation'] == 'slide') {
			reset_slide_position = false;
			target_slide = image_num
			last_slide = $('.slide', $this).last().index()
			clearTimeout(_this.reset_position_timeout)

			$('.slide, .slide_placeholder', $this).removeClass('no_transition')

			// Wrap animations
			if(loop_slider && image_num == 0) {
				reset_slide_position = "first"
				target_slide = last_slide + 1
			}
			else if(loop_slider && image_num == last_slide) {
				if(!$('.slide_placeholder', $this).first().hasClass('image_loaded')) loadImage($('.slide_placeholder', $this).first())
				reset_slide_position = "last"
				target_slide = -1
			}
			loop_slider = 0

			$('.current_slide', $this).removeClass('current_slide')
			$('.slide', $this).eq(image_num).addClass('current_slide');
			translate_target = target_slide * -100;
			$('.slide, .slide_placeholder', $this).css('transform','translateX('+translate_target+'%)')

			if(reset_slide_position == "first") {
				_this.reset_position_timeout = setTimeout(function() {
					$('.slide, .slide_placeholder', $this).addClass('no_transition')
					$('.slide, .slide_placeholder', $this).css('transform','translateX(0%)');
				}, _this.settings['transition_time'])
			}

			if(reset_slide_position == "last") {
				_this.reset_position_timeout = setTimeout(function() {
					$('.slide, .slide_placeholder', $this).addClass('no_transition')
					$('.slide, .slide_placeholder', $this).css('transform','translateX(-'+ (last_slide * 100) +'%)');
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
					$('.slide', $this).eq(image_num).addClass('current_slide').fadeIn(_this.settings['transition_time'], function() { $('.slide:not(.current_slide)', $this).hide(); });
				}

				// Otherwise, show new image and fade out current
				else if(image_num < $('.current_slide', $this).index()) {
					$('.current_slide', $this).removeClass('current_slide').fadeOut(_this.settings['transition_time']);
					$('.slide', $this).eq(image_num).addClass('current_slide').show();
				}
			}

			// Whereas 'contain' mode looks weird when different sized images stay on the screen too long
			else {
				$('.current_slide', $this).removeClass('current_slide').fadeOut(_this.settings['transition_time']);
				$('.slide', $this).eq(image_num).addClass('current_slide').fadeIn(_this.settings['transition_time']);
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
				let caption = $('.current_slide img', $this).attr('caption') || $('.current_slide video', $this).attr('caption') || $('.current_slide figure', $this).attr('caption');
				if(!caption) caption = '';
				$('.square1_caption', $this).html(caption).fadeIn(_this.settings['transition_time'] - 200);
			}, 10)
		});
	}

	function update_dots_nav() {
		if(_this.settings['dots_nav'] == 'none') {
			$('.square1_dots', $this).remove();
			return;
		}
		$('.square1_dots button', $this).removeClass('current');
		$('.square1_dots button[data-image-num="' + $('.current_slide', $this).index() + '"]', $this).addClass('current');
	}
	return $this;

}; // $.fn.square1
}(jQuery));
