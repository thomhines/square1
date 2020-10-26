# Square1
A very simple image slider that will responsively work with images of any size or shape.
*requires jQuery*

### [Demo](http://projects.thomhines.com/square1/)


## Installation

1. Link to jQuery

		<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>

2. Link to the Square1 JS and CSS

		<link rel="Stylesheet" href="square1/square1.min.css" type="text/css" />
		<script src="square1/square1.min.js"></script>

3. Turn your images into a slideshow

	#### HTML:

	You can create a slideshow from a list of images:

		<div class="slideshow">
			<img src="image1.png" alt="Caption 1">
			<img data-src="image2.png" alt="Caption 2">
			<img data-src="image3.png" alt="Caption 3">
		</div>

	*Note*: Appending **data-** to the 'src' and 'srcset' attributes will enable async loading (eg. data-src="image1.png").


	OR, you can include slides as HTML content elements. The `img` tag inside the slide will be used as the slide's background:

		<div class="slideshow">
			<div>
				<img src="image1.png" alt="Caption 1">
				<h3>Slide Title</h3>
			</div>
			<div>
				<img src="image2.png" alt="Caption 2">
				<h3>Slide Title</h3>
			</div>
			<div>
				<img src="image3.png" alt="Caption 3">
				<h3>Slide Title</h3>
			</div>
		</div>


	Additionally, if you are using the default "cover" fill mode to scale your images, you can set the point from which the image should scale from by adding the 'scale-from' attribute to your images. You can use any values that work with the CSS [background-position](https://www.w3schools.com/cssref/pr_background-position.asp) property.

		<img src="image1.png alt="Caption 1" scale-from="right top">
		<img data-src="image2.png alt="Caption 2" scale-from="center bottom">
		<img data-src="image3.png alt="Caption 3" scale-from="left bottom">


	#### JS:

		$(function() {
			$('.slideshow').square1();
		});




## Slideshow Options

All modifications to how the slideshow runs are optional. To change the default behavior, simply add the options you want to change to the `square1()` function like so:

	$('.slideshow').square1({
		slide_duration: 8000,
		dots_nav: 'hover'
	});


Here are all of the options with their default values:


	width: 			$(_this).width(), 	// options: any CSS measurement. Blank values will default to whatever is set in CSS, or 'auto' if no CSS is set.
	height: 		$(_this).height(),  	// options: any CSS measurement. Blank values will default to whatever is set in CSS, or the height of the first image if no CSS is set.
	animation: 		'fade', 		// Transition animation style. Values: 'fade' or 'slide'
	fill_mode: 		'cover', 		// Determines how images fill slideshow. Values: 'contain', 'cover', or pixel/percent value
	scale_from: 		'center', 		// Values: all values that work for CSS background-position property (eg. 'right bottom', '100px 300px', etc.). Default set to 'center center' in CSS
	background:		'none',			// Set slideshow background color. Values: any CSS color or valid CSS background value
	auto_start: 		true,			// Set whether slideshow autoplays or not. Values: true/false
	start_delay: 		0, 			// If auto_start is true, set how long to wait before slideshow starts. Values: ms
	slide_duration: 	4000, 			// Amount of time each slide is shown before progressing to next. Values: ms
	transition_time: 	500, 			// Amount of time it takes to transition from one slie to next. Values: ms
	pause_on_hover: 	true,			// Pause autoplay if user hovers mouse over slideshow. Values: true/valse
	keyboard: 		true,			// Allow users to control slideshow with arrow keys. Will automatically add slideshows into keyboard tab order. Values: true/valse
	gestures: 		true,			// Allow users to control slideshow with touch gestures (swipe left/right). Values: true/valse
	lazy_load: 		false,			// Enabling this will load images as they are needed instead of on page load
	theme:			'dark',			// Set color palette of slideshow UI elements. Values: 'dark', 'light'
	prev_next_nav: 		'inside', 		// How to display (or not) the arrow nav buttons. Values: 'inside', 'outside', 'hover', 'none'
	dots_nav: 		'inside', 		// How to display (or not) the dot nav buttons. Values: 'inside', 'outside', 'hover', 'none'
	caption: 		'outside', 		// How to display (or not) image captions. Values: 'inside', 'outside', 'hover', 'none'

	// Callback functions
	onLoad: 		function() {},		// Triggered when slideshow has completed loading
	onPlay: 		function() {},		// Triggered when slideshow starts playing
	onStop: 		function() {},		// Triggered when slideshow stops playing
	onChange: 		function() {}		// Triggered after slide has changed


## Slideshow Remote Control Functions

You can also control any Square1 slideshow remotely via JS:

	// Start slideshow
	$('.slideshow').square1('play');

	// Stop slideshow
	$('.slideshow').square1('stop');

	// Go to next slide
	$('.slideshow').square1('next');

	// Go to previous slide
	$('.slideshow').square1('prev');

	// Jump to slide N (or any integer);
	$('.slideshow').square1(5);



## Other Settings

If you are using the default "cover" fill mode to scale your images, you can set the point from which the image should scale from (ie. which corner of the image will be pinned in place if parts of the image need to be scaled and cropped). You can use any values that work with the CSS [background-position](https://www.w3schools.com/cssref/pr_background-position.asp) property.

And you can set this on an image-by-image basis by adding the 'scale-from' attribute to your images (resize your browser to see the result):

  	<img src="image1.png" alt="Caption 1" scale-from="top left" scale-from-mobile="bottom center">


## Thanks

Thanks to http://isorepublic.com/ for the images
