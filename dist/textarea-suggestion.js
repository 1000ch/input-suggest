(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TextAreaSuggestion = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
/* jshint browser: true */

(function () {

// The properties that we copy into a mirrored div.
// Note that some browsers, such as Firefox,
// do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
// so we have to do every single property specifically.
var properties = [
  'direction',  // RTL support
  'boxSizing',
  'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY',  // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',  // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize'

];

var isFirefox = window.mozInnerScreenX != null;

function getCaretCoordinates(element, position) {
  // mirrored div
  var div = document.createElement('div');
  div.id = 'input-textarea-caret-position-mirror-div';
  document.body.appendChild(div);

  var style = div.style;
  var computed = window.getComputedStyle? getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9

  // default textarea styles
  style.whiteSpace = 'pre-wrap';
  if (element.nodeName !== 'INPUT')
    style.wordWrap = 'break-word';  // only for textarea-s

  // position off-screen
  style.position = 'absolute';  // required to return coordinates properly
  style.visibility = 'hidden';  // not 'display: none' because we want rendering

  // transfer the element's properties to the div
  properties.forEach(function (prop) {
    style[prop] = computed[prop];
  });

  if (isFirefox) {
    // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
    if (element.scrollHeight > parseInt(computed.height))
      style.overflowY = 'scroll';
  } else {
    style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
  }

  div.textContent = element.value.substring(0, position);
  // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (element.nodeName === 'INPUT')
    div.textContent = div.textContent.replace(/\s/g, "\u00a0");

  var span = document.createElement('span');
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // for inputs, just '.' would be enough, but why bother?
  span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
  div.appendChild(span);

  var coordinates = {
    top: span.offsetTop + parseInt(computed['borderTopWidth']),
    left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
  };

  document.body.removeChild(div);

  return coordinates;
}

if (typeof module != "undefined" && typeof module.exports != "undefined") {
  module.exports = getCaretCoordinates;
} else {
  window.getCaretCoordinates = getCaretCoordinates;
}

}());

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var TextArea = require('./textarea');
var Suggestion = require('./suggestion');

var TextAreaSuggestion = (function () {
  function TextAreaSuggestion(textarea, suggestions) {
    var _this = this;

    _classCallCheck(this, TextAreaSuggestion);

    if (!textarea) {
      throw new Error('Invalid argument');
    }

    if (typeof textarea === 'string') {
      textarea = document.querySelector(textarea);
    }

    this.textArea = new TextArea(textarea);
    this.suggestion = new Suggestion(suggestions);
    this.text = '';

    this.textArea.on('input', function (input) {

      if (_this.suggestion.isShown) {
        if (_this.textArea.isDeleted && _this.text.length !== 0) {
          _this.text = _this.text.substring(0, _this.text.length - 1);
        } else {
          _this.text += input;
        }
      } else {
        _this.text = input;
      }

      _this.suggestion.setMatcher(_this.text);

      if (_this.text.length !== 0 && _this.suggestion.matched.length !== 0) {
        var position = _this.textArea.popupPosition;
        _this.suggestion.prepareItems();
        _this.suggestion.show(position.top, position.left);
      } else {
        _this.suggestion.hide();
      }
    });

    this.textArea.on('enter', function (e) {
      if (_this.suggestion.isSelected) {
        e.preventDefault();
        _this.textArea.insert(_this.text, _this.suggestion.selected);
      }
      _this.suggestion.hide();
    });

    this.textArea.on('up', function (e) {
      if (_this.suggestion.isShown) {
        e.preventDefault();
        if (_this.suggestion.selectedIndex > 0) {
          _this.suggestion.selectedIndex--;
        }
        _this.suggestion.highlight();
      }
    });

    this.textArea.on('down', function (e) {
      if (_this.suggestion.isShown) {
        e.preventDefault();
        if (_this.suggestion.selectedIndex < _this.suggestion.matched.length - 1) {
          _this.suggestion.selectedIndex++;
        }
        _this.suggestion.highlight();
      }
    });

    this.suggestion.on('click', function (e) {
      _this.textArea.insert(_this.text, e.target.textContent);
      _this.suggestion.hide();
    });
  }

  _createClass(TextAreaSuggestion, [{
    key: 'setSuggestions',
    value: function setSuggestions(suggestions) {
      this.suggestion.setSuggestions(suggestions);
    }
  }]);

  return TextAreaSuggestion;
})();

if (module !== undefined && module.exports !== undefined) {
  module.exports = TextAreaSuggestion;
} else {
  window.TextAreaSuggestion = TextAreaSuggestion;
}

},{"./suggestion":4,"./textarea":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;

var Suggestion = (function (_EventEmitter) {
  function Suggestion(suggestions) {
    _classCallCheck(this, Suggestion);

    _get(Object.getPrototypeOf(Suggestion.prototype), 'constructor', this).call(this);

    this.selectedIndex = -1;
    this.suggestions = [];
    this.container = null;
    this.list = [];
    this.matcher = '';

    this.setSuggestions(suggestions);
    this.prepareContainer();
  }

  _inherits(Suggestion, _EventEmitter);

  _createClass(Suggestion, [{
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
    key: 'prepareItems',
    value: function prepareItems() {
      this.list.length = 0;
      this.container.innerHTML = '';

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.matched[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var suggestion = _step.value;

          var item = document.createElement('li');
          item.className = 'suggestion__item';
          item.textContent = suggestion;
          item.addEventListener('click', this.onClick.bind(this));
          this.list.push(item);
          this.container.appendChild(item);
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
    }
  }, {
    key: 'setMatcher',
    value: function setMatcher(matcher) {
      this.matcher = matcher;
    }
  }, {
    key: 'setSuggestions',
    value: function setSuggestions() {
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
    key: 'show',
    value: function show(top, left) {
      this.container.style.top = top + 'px';
      this.container.style.left = left + 'px';
      this.container.style.display = 'block';
      this.container.classList.add('is-shown');
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.container.style.display = 'none';
      this.selectedIndex = -1;
      this.container.classList.remove('is-shown');
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var item = _step3.value;

          item.classList.remove('is-selected');
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
    key: 'highlight',
    value: function highlight() {
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

      this.list[this.selectedIndex].classList.add('is-selected');
    }
  }, {
    key: 'onClick',
    value: function onClick(e) {
      this.emit('click', e);
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
    key: 'matched',
    get: function () {
      var _this = this;

      return this.suggestions.filter(function (suggestion) {
        return suggestion.indexOf(_this.matcher) !== -1;
      });
    }
  }, {
    key: 'selected',
    get: function () {
      return this.matched[this.selectedIndex];
    }
  }]);

  return Suggestion;
})(EventEmitter);

exports['default'] = Suggestion;
module.exports = exports['default'];

},{"events":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require('events').EventEmitter;
var getCaret = require('textarea-caret-position/index.js');

var VK_DELETE = 8;
var VK_ENTER = 13;
var VK_UP = 38;
var VK_DOWN = 40;

var TextArea = (function (_EventEmitter) {
  function TextArea(textarea) {
    _classCallCheck(this, TextArea);

    _get(Object.getPrototypeOf(TextArea.prototype), 'constructor', this).call(this);

    this.textarea = textarea;
    this.style = getComputedStyle(textarea);

    this.selectionStart = 0;
    this.selectionEnd = 0;
    this.input = '';
    this.isDeleted = false;

    textarea.addEventListener('input', this.onInput.bind(this));
    textarea.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  _inherits(TextArea, _EventEmitter);

  _createClass(TextArea, [{
    key: 'insert',
    value: function insert(match, text) {
      var caretIndex = this.selectionEnd + text.length;
      this.textarea.setSelectionRange(this.selectionEnd - match.length, this.selectionEnd);
      this.textarea.setRangeText(text);
      this.textarea.setSelectionRange(caretIndex, caretIndex);
    }
  }, {
    key: 'onInput',
    value: function onInput(e) {
      this.selectionStart = e.target.selectionStart;
      this.selectionEnd = e.target.selectionEnd;

      if (this.isDeleted) {
        this.input = '';
      } else {
        this.input = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);
      }

      this.emit('input', this.input);
    }
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      switch (e.keyCode) {
        case VK_DELETE:
          this.emit('delete');
          this.isDeleted = true;
          break;
        case VK_ENTER:
          this.emit('enter', e);
          break;
        case VK_UP:
          this.emit('up', e);
          break;
        case VK_DOWN:
          this.emit('down', e);
          break;
        default:
          this.isDeleted = false;
          break;
      }
    }
  }, {
    key: 'fontSize',
    get: function () {
      return Number(this.style['font-size'].replace(/(px)/, ''));
    }
  }, {
    key: 'position',
    get: function () {
      return {
        top: this.textarea.offsetTop,
        left: this.textarea.offsetLeft
      };
    }
  }, {
    key: 'popupPosition',
    get: function () {
      var textarea = this.position;
      var caret = getCaret(this.textarea, this.textarea.selectionEnd);
      return {
        top: textarea.top + caret.top + this.fontSize,
        left: textarea.left + caret.left
      };
    }
  }]);

  return TextArea;
})(EventEmitter);

exports['default'] = TextArea;
module.exports = exports['default'];

},{"events":1,"textarea-caret-position/index.js":2}]},{},[3])(3)
});