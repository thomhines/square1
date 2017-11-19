# Square1
A very simple image slider that will responsively work with images of any size or shape.



*requires jQuery*


## Installation

1. Link to jQuery

		<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>

2. Link to the Square1 JS and CSS

		<link rel="Stylesheet" href="square1/square1.min.css" type="text/css" />
		<script src="square1/square1.min.js"></script>

3. Turn your images into a slideshow

	#### HTML:

	You can create a slideshow from a list of images:

		<div class="slideshow">
			<img src="image1.png" alt="Caption 1">
			<img src="image2.png" alt="Caption 2">
			<img src="image3.png" alt="Caption 3">
		</div>


	OR, you can include slides as HTML content elements. The <img> tag inside the slide will be used as the slide's background:

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


	#### JS:

		$(function() {
			$('.slideshow').square1();
		});




## Slideshow Options

All modifications to how the slideshow runs are optional. To change the default behavior, simply add the options you want to change to the square1() function like so:

	$('.slideshow').square1({
		slide_duration: 8000,
		dots_nav: 'hover'
	});


Here are all of the options with their default values:

	width: 				$(_this).width(), 		// options: any specific measurement (px, em, vw, etc.) will work. Blank values will default to whatever size the CSS dictates.
	height: 			$(_this).height(),  	// options: any specific measurement (px, em, vw, etc.) will work. Blank values will default to whatever size the CSS dictates.
	fill_mode: 			'cover', 				// options: 'contain', 'cover', or pixel/percent value
	background:			'#fff',					// color values
	auto_start: 		true,					// true/false
	start_delay: 		0, 						// value in ms
	slide_duration: 	4000, 					// value in ms
	transition_time: 	500, 					// value in ms
	pause_on_hover: 	true,					// true/valse
	theme:				'dark',					// options: 'dark', 'light'
	prev_next_nav: 		'inside', 				// options: 'inside', 'outside', 'hover', 'none'
	dots_nav: 			'inside', 				// options: 'inside', 'outside', 'hover', 'none'
	caption: 			'outside', 				// options: 'inside', 'outside', 'hover', 'none'

	// Callback functions
	onPlay: 			function() {},
	onStop: 			function() {},
	onChange: 			function() {}




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






## Thanks

Thanks to http://isorepublic.com/ for the images
