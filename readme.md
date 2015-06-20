# textarea-suggestion

Show suggestions when input.

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
  var textarea   = document.querySelector('textarea');
  var suggestion = new TextareaSuggestion(textarea);
  suggestion.setSuggestions(['Apple', 'Apple Watch', 'Mac', 'iPad', 'iPhone', 'iPod', 'iPod Touch']);
</script>
```

## License

MIT: http://1000ch.mit-license.org
