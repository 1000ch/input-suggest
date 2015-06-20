# textarea-suggestion

Show suggestions when you input.

## Install

Using npm:

```sh
$ npm install textarea-suggestion
```

Using bower:

```sh
$ bower install textarea-suggestion
```

## Usage

```html
<textarea></textarea>
<script>
  var tas = new TextAreaSuggestion('textarea');
  tas.setSuggestions(['Apple', 'Apple Watch', 'Mac', 'iPad', 'iPhone', 'iPod', 'iPod Touch']);
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
