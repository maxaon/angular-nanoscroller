# Angular nanoScroller

Wrapper for [nanoScrollerJS](http://jamesflorentino.github.io/nanoScrollerJS/)
with AngularJS lifecycle integration. 
[Demo plunker](http://embed.plnkr.co/pnSkmuRc7HjXjMG0DdrT/preview)

## Installation

To use it include `scrollable.js` above your app.
Also yiu mus include [nanoScrollerJS](http://jamesflorentino.github.io/nanoScrollerJS/) files.
```html
<link rel="stylesheet" href="nanoscroller.css"/>
<script src="jquery.nanoscroller.js" type="text/javascript"></script>
<script src="scrollable.js" type="text/javascript"></script>
```

Also you can use bower:
`bower install angular-nanoscroller`

Next, make sure to add **`sun.scrollable`** to your Angular app/module requirements:
```javascript
var module = angular.module('app', ['sun.scrollable']);
```

## Usage

Scroll can be added as element:
```html
<div class="some-container">
  <scrollable>
    ... Some content ...
  </scrollable>
</div>
```

Or as attribute:
```html
<div class="some-container" scrollable>
  ... Some content ...
</div>
```

To use custom CSS classes, over root template tag, use element syntax.
Parameters of the nanoScroller can be supplied as the value of the attribute `scrollable`,
or as `scrollable` element attributes.
```html
<div class="some-container">
  <scrollable class="greenScrollbar" always-visible="true" slider-max-height="200">
    ... Some content ...
  </scrollable>
</div>
OR
<div class="some-container" scrollable="{alwaysVisible='true'}">
  ... Some content ...
</div>
```

### Additional attributes

Using attribute `static` will disable automatic scrollbar reconfiguration
when height of content is changed.

Attributes `watch` and `watch-collection` will force nanoScroller updates only when objects are changed.
To watch multiple objects separate it names throw `;` or `,`.

## Configuration
To configure `scrollable` change constant `scrollableConfig`.

Available parameters:
* `template` - Template of the scroller. Uses `ng-transclude` for directive transclusion
* `bottomMargin` -  Available number of pixels from the bottom,
in which it is considered that scroller is in bottom. Default is '40'

To set default parameters of the nanoScroller modify constant `nanoScrollerDefaults`.
All parameters will be passed to nanoScroller during configuration stage.




[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/maxaon/angular-nanoscroller/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

