# Square1
A very simple jQuery image/content slider that responsively handles images of any size or shape.

*Requires jQuery*

### [Demo](http://projects.thomhines.com/square1/)


## Installation

### 1) Manual installation

Download or copy the project files into your web-accessible assets directory, then load jQuery and Square1:

```html
<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<link rel="Stylesheet" href="/path/to/square1/square1.min.css" type="text/css" />
<script src="/path/to/square1/square1.min.js"></script>
```

### 2) Composer (Packagist)

Install with Composer:

```bash
composer require thomhines/square1
```

Then include files from your Composer `vendor` directory:

```html
<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<link rel="Stylesheet" href="/vendor/thomhines/square1/square1.min.css" type="text/css" />
<script src="/vendor/thomhines/square1/square1.min.js"></script>
```

### 3) Git submodule

Add Square1 as a submodule:

```bash
git submodule add https://github.com/thomhines/square1.git vendor/square1
git submodule update --init --recursive
```

Then include it in your page:

```html
<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
<link rel="Stylesheet" href="/vendor/square1/square1.min.css" type="text/css" />
<script src="/vendor/square1/square1.min.js"></script>
```

### Usage

#### HTML

Each **direct child** of the slideshow container is wrapped in an internal **slide** element. You can use a flat list of images:

```html
<div class="slideshow">
	<img src="image1.png" alt="Short label" caption="Longer caption text">
	<img data-src="image2.png" alt="Short label" caption="Caption 2">
	<img data-src="image3.png" alt="Short label" caption="Caption 3">
</div>
```

* **`caption`** — optional; used by the caption UI when enabled (in addition to `alt`).
* **`data-src` / `data-srcset`** — optional **data-** prefix delays loading until Square1 promotes them to `src` / `srcset` (sequential loading). Pair with the **`lazy_load`** option to load each slide only when needed.
* **`srcset` / `sizes`** — optional; native responsive selection applies to visible images.
* **`scale-from` / `scale-from-mobile`** — optional per-image **`object-position`**; on narrow viewports (under 600px), `scale-from-mobile` wins when present.
* **`space`** — optional; copied onto the slide wrapper for advanced filtering (see global `filter_gallery` in the script if you use tagged slides).

Or use **rich slides** (first `<img>` in each child is the photo layer; remaining markup is overlaid or non-image slides without an `<img>`):

```html
<div class="slideshow">
	<div>
		<img src="image1.png" alt="Caption 1">
		<h3>Slide title</h3>
	</div>
	<div>
		<img src="image2.png" alt="Caption 2">
		<h3>Slide title</h3>
	</div>
</div>
```

#### JavaScript

```javascript
$(function() {
	$('.slideshow').square1();
});
```

## Slideshow options

Pass an object of overrides to **`square1()`**:

```javascript
$('.slideshow').square1({
	slide_duration: 8000,
	dots_nav: 'hover'
});
```

Defaults and meanings (see **`square1.js`** for inline comments):

| Option | Default | Description |
|--------|---------|-------------|
| **`width`** | `''` | Any CSS width. Blank uses stylesheet / block layout (demo uses full width). |
| **`height`** | `''` | Any CSS height. When blank and **`aspect_ratio`** is also blank, the first decoded image sets **`aspect-ratio`** on the root so the box gets a height. |
| **`aspect_ratio`** | `''` | Any valid CSS **`aspect-ratio`** (e.g. `'16/9'`, `'1.3'`). When set, height is applied as **`auto`** so the box sizes from width and this ratio. |
| **`animation`** | `'fade'` | `'fade'` or `'slide'`. |
| **`fill_mode`** | `'cover'` | `'cover'` or `'contain'` — maps to **`object-fit`** on slide images. |
| **`scale_from`** | `'center center'` | Default **`object-position`** for images (same keyword grammar as CSS). |
| **`start_delay`** | `0` | Milliseconds before autoplay when **`auto_start`** is true. |
| **`slide_duration`** | `4000` | Milliseconds each slide stays visible. |
| **`transition_time`** | `500` | Transition duration in ms. |
| **`lazy_load`** | `false` | When **`true`**, does not pre-load the sequential chain; images load when needed (still use **`data-src`** / **`data-srcset`** where appropriate). |
| **`auto_start`** | `true` | Start the timer automatically. |
| **`pause_on_hover`** | `false` | Pause autoplay while the pointer is over the slideshow. |
| **`keyboard`** | `true` | Arrow keys; tabindex is set when enabled. |
| **`gestures`** | `true` | Swipe to change slides on touch devices. |
| **`theme`** | `'dark'` | `'dark'` or `'light'` UI chrome. |
| **`background`** | `'none'` | CSS background on the slideshow root. |
| **`prev_next_nav`** | `'inside'` | `'inside'`, `'outside'`, `'hover'`, or `'none'`. |
| **`dots_nav`** | `'inside'` | Same choices as arrows. |
| **`caption`** | `'outside'` | `'inside'`, `'outside'`, `'hover'`, or `'none'` — uses the **`caption`** attribute when present. |
| **`onLoad`** | `function () {}` | Fires when all slides have finished loading. |
| **`onPlay`** | `function () {}` | Fires when playback starts. |
| **`onStop`** | `function () {}` | Fires when playback stops. |
| **`onChange`** | `function () {}` | Fires after the active slide changes. |


## Remote control

```javascript
$('.slideshow').square1('play');
$('.slideshow').square1('stop');
$('.slideshow').square1('next');
$('.slideshow').square1('prev');
$('.slideshow').square1(5);   // jump to slide 5 (1-based index)
```


## License

Square1 is released under the MIT License. See the [`LICENSE`](LICENSE) file for full text.


## Thanks

Thanks to the following image providers used in the demos:

- https://isorepublic.com/
- https://placehold.co/
- https://picsum.photos/
