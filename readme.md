# input-suggest

[![](https://circleci.com/gh/:1000ch/input-suggest.svg?style=shield&circle-token=c2cd81d5e68b0c2429278a315f2c1249c0d09378)](https://circleci.com/gh/1000ch/input-suggest)
[![NPM version](https://badge.fury.io/js/input-suggest.svg)](http://badge.fury.io/js/input-suggest)
[![Dependency Status](https://david-dm.org/1000ch/input-suggest.svg)](https://david-dm.org/1000ch/input-suggest)
[![devDependency Status](https://david-dm.org/1000ch/input-suggest/dev-status.svg)](https://david-dm.org/1000ch/input-suggest#info=devDependencies)

Show suggestions when you input.

## Install

Using npm:

```sh
$ npm install input-suggest
```

Using bower:

```sh
$ bower install input-suggest
```

## Usage

```html
<textarea></textarea>
<script>
  var is = new InputSuggest('textarea');
  is.setSuggestions(['Apple', 'Apple Watch', 'Mac', 'iPad', 'iPhone', 'iPod', 'iPod Touch']);
</script>
```

## Customize popup

You can style popup with following HTML structure.

```html
<ul class="suggestion is-shown">
  <li class="suggestion__item is-selected">Item1 is selected</li>
  <li class="suggestion__item">Item2</li>
  <li class="suggestion__item">Item3</li>
</ul>
```

## License

MIT: http://1000ch.mit-license.org
