(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TextareaSuggestion = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint browser: true */

'use strict';

(function () {

  // The properties that we copy into a mirrored div.
  // Note that some browsers, such as Firefox,
  // do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
  // so we have to do every single property specifically.
  var properties = ['direction', // RTL support
  'boxSizing', 'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height', 'overflowX', 'overflowY', // copy the scrollbar for IE

  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration', // might not make a difference, but better be safe

  'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'];

  var isFirefox = window.mozInnerScreenX != null;

  function getCaretCoordinates(element, position) {
    // mirrored div
    var div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);

    var style = div.style;
    var computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle; // currentStyle for IE < 9

    // default textarea styles
    style.whiteSpace = 'pre-wrap';
    if (element.nodeName !== 'INPUT') style.wordWrap = 'break-word'; // only for textarea-s

    // position off-screen
    style.position = 'absolute'; // required to return coordinates properly
    style.visibility = 'hidden'; // not 'display: none' because we want rendering

    // transfer the element's properties to the div
    properties.forEach(function (prop) {
      style[prop] = computed[prop];
    });

    if (isFirefox) {
      // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
      if (element.scrollHeight > parseInt(computed.height)) style.overflowY = 'scroll';
    } else {
      style.overflow = 'hidden'; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
    }

    div.textContent = element.value.substring(0, position);
    // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
    if (element.nodeName === 'INPUT') div.textContent = div.textContent.replace(/\s/g, ' ');

    var span = document.createElement('span');
    // Wrapping must be replicated *exactly*, including when a long word gets
    // onto the next line, with whitespace at the end of the line before (#7).
    // The  *only* reliable way to do that is to copy the *entire* rest of the
    // textarea's content into the <span> created at the caret position.
    // for inputs, just '.' would be enough, but why bother?
    span.textContent = element.value.substring(position) || '.'; // || because a completely empty faux span doesn't render at all
    div.appendChild(span);

    var coordinates = {
      top: span.offsetTop + parseInt(computed['borderTopWidth']),
      left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
    };

    document.body.removeChild(div);

    return coordinates;
  }

  if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
    module.exports = getCaretCoordinates;
  } else {
    window.getCaretCoordinates = getCaretCoordinates;
  }
})();

},{}],2:[function(require,module,exports){
/*! http://mths.be/startswith v0.2.0 by @mathias */
if (!String.prototype.startsWith) {
	(function() {
		'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var toString = {}.toString;
		var startsWith = function(search) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			if (search && toString.call(search) == '[object RegExp]') {
				throw TypeError();
			}
			var stringLength = string.length;
			var searchString = String(search);
			var searchLength = searchString.length;
			var position = arguments.length > 1 ? arguments[1] : undefined;
			// `ToInteger`
			var pos = position ? Number(position) : 0;
			if (pos != pos) { // better `isNaN`
				pos = 0;
			}
			var start = Math.min(Math.max(pos, 0), stringLength);
			// Avoid the `indexOf` call if no match is possible
			if (searchLength + start > stringLength) {
				return false;
			}
			var index = -1;
			while (++index < searchLength) {
				if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
					return false;
				}
			}
			return true;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'startsWith', {
				'value': startsWith,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.startsWith = startsWith;
		}
	}());
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('string.prototype.startswith');

var getCaretCoordinates = require("./../bower_components/textarea-caret-position/index.js");

var TextareaSuggestion = (function () {
  function TextareaSuggestion(textarea, suggestions) {
    _classCallCheck(this, TextareaSuggestion);

    if (!textarea) {
      throw new Error('Invalid element');
    }

    if (typeof textarea === 'string') {
      textarea = document.querySelector(textarea);
    }

    this.selectedIndex = -1;
    this.suggestions = [];
    this.textarea = textarea;
    this.textareaStyle = getComputedStyle(this.textarea);
    this.textareaFontSize = this.textareaStyle['font-size'].replace(/(px)/, '') - 0;
    this.container = null;
    this.list = [];

    this.setSuggestion(suggestions);
    this.prepareContainer();

    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.inputText = '';
    this.lastInputText = '';
    this.isDeleted = false;

    textarea.addEventListener('input', this.onInput.bind(this));
    textarea.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  _createClass(TextareaSuggestion, [{
    key: 'onInput',
    value: function onInput(e) {
      this.selectionStart = e.target.selectionStart;
      this.selectionEnd = e.target.selectionEnd;
      this.lastInputText = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);

      if (this.isShown) {
        if (this.isDeleted) {
          console.log(this.lastInputText);
        } else {
          this.inputText += this.lastInputText;
        }
      } else {
        this.inputText = this.lastInputText;
      }

      if (this.inputText.length !== 0 && this.matchedSuggestions.length !== 0) {
        this.prepareItems();
        this.showPopup();
      } else {
        this.hidePopup();
      }
    }
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      switch (e.keyCode) {
        case 8:
          //del
          if (this.isShown) {
            var lastIndex = this.inputText.lastIndexOf(this.lastInputText);
            this.inputText = this.inputText.substring(0, lastIndex);
            this.isDeleted = true;
          }
          break;
        case 13:
          //enter
          if (this.isSelected) {
            e.preventDefault();
            var suggestion = this.matchedSuggestions[this.selectedIndex];
            this.insertSuggestion(suggestion);
          }
          this.hidePopup();
          break;
        case 38:
          //up
          if (this.selectedIndex > 0) {
            this.selectedIndex--;
          }
          if (this.isShown) {
            e.preventDefault();
            this.highlightSelectedIndex();
          }
          break;
        case 40:
          //down
          if (this.selectedIndex < this.matchedSuggestions.length - 1) {
            this.selectedIndex++;
          }
          if (this.isShown) {
            e.preventDefault();
            this.highlightSelectedIndex();
          }
          break;
        default:
          if (this.isShown) {
            this.isDeleted = false;
          } else {
            this.hidePopup();
          }
          break;
      }
    }
  }, {
    key: 'highlightSelectedIndex',
    value: function highlightSelectedIndex() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          item.classList.remove('is-selected');
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.list[this.selectedIndex].classList.add('is-selected');
    }
  }, {
    key: 'setSuggestion',
    value: function setSuggestion() {
      var suggestions = arguments[0] === undefined ? [] : arguments[0];

      if (!Array.isArray(suggestions)) {
        suggestions = [suggestions];
      }

      this.suggestions.length = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = suggestions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var suggestion = _step2.value;

          if (typeof suggestion === 'string') {
            this.suggestions.push(suggestion);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'prepareContainer',
    value: function prepareContainer() {
      if (this.container == null) {
        this.container = document.createElement('ul');
        this.container.className = 'suggestion';
        this.container.style.position = 'absolute';
        this.container.style.display = 'none';
        this.container.style.listStyle = 'none';
        document.body.appendChild(this.container);
      }
    }
  }, {
    key: 'onClick',
    value: function onClick(e) {
      this.insertSuggestion(e.target.textContent);
      this.hidePopup();
    }
  }, {
    key: 'prepareItems',
    value: function prepareItems() {

      this.list.length = 0;
      this.container.innerHTML = '';

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.matchedSuggestions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var suggestion = _step3.value;

          var item = document.createElement('li');
          item.className = 'suggestion__item';
          item.textContent = suggestion;
          item.addEventListener('click', this.onClick.bind(this));
          this.list.push(item);
          this.container.appendChild(item);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: 'insertSuggestion',
    value: function insertSuggestion(suggestion) {
      this.textarea.setSelectionRange(this.selectionEnd - this.inputText.length, this.selectionEnd);
      this.textarea.setRangeText(suggestion);
      var caretIndex = this.selectionEnd + suggestion.length;
      this.textarea.setSelectionRange(caretIndex, caretIndex);
    }
  }, {
    key: 'showPopup',
    value: function showPopup() {
      var position = this.popupPosition;
      this.container.style.top = position.top + this.textareaFontSize + 'px';
      this.container.style.left = position.left + 'px';
      this.container.style.display = 'block';

      this.container.classList.add('is-shown');
    }
  }, {
    key: 'hidePopup',
    value: function hidePopup() {
      this.container.style.display = 'none';
      this.selectedIndex = -1;

      this.container.classList.remove('is-shown');
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.list[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var item = _step4.value;

          item.classList.remove('is-selected');
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: 'isSelected',
    get: function () {
      return this.isShown && this.selectedIndex !== -1;
    }
  }, {
    key: 'isShown',
    get: function () {
      return this.container.classList.contains('is-shown');
    }
  }, {
    key: 'matchedSuggestions',
    get: function () {
      var _this = this;

      return this.suggestions.filter(function (suggestion) {
        return suggestion.startsWith(_this.inputText);
      });
    }
  }, {
    key: 'popupPosition',
    get: function () {
      var coordinates = getCaretCoordinates(this.textarea, this.textarea.selectionEnd);
      return {
        top: this.textarea.offsetTop + coordinates.top,
        left: this.textarea.offsetLeft + coordinates.left
      };
    }
  }]);

  return TextareaSuggestion;
})();

exports['default'] = TextareaSuggestion;
module.exports = exports['default'];

},{"./../bower_components/textarea-caret-position/index.js":1,"string.prototype.startswith":2}]},{},[3])(3)
});