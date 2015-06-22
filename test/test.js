'use strict';

import assert       from 'power-assert';
import InputSuggest from '../src/index';

describe('InputSuggest', function() {

  it('throw error with no arguments', function() {
    assert.throws(function() {
      new InputSuggest();
    });
  });

  it('accepts a textarea element as argument', function() {
    assert.doesNotThrow(function() {
      new InputSuggest(document.createElement('textarea'));
    });
  });

  it('accepts a input element as argument', function() {
    assert.doesNotThrow(function() {
      new InputSuggest(document.createElement('input'));
    });
  });

  it('accepts a input element and some string parameters as argument', function() {
    assert.doesNotThrow(function() {
      new InputSuggest(document.createElement('input'), ['foo', 'bar', 'baz']);
    });
  });

  it('return suggestion candidates', function() {
    let inputSuggest = new InputSuggest(document.createElement('input'), ['foo', 'bar', 'baz']);
    assert.ok(inputSuggest.suggestion.suggestions.length === 3);
  });

  it('return matched suggestions', function() {
    let input = document.createElement('input');
    let suggest = new InputSuggest(input, ['foo', 'bAr', 'BaZ']);
    suggest.suggestion.setMatcher('a');
    assert.ok(suggest.suggestion.matched.length === 2);
    suggest.suggestion.setMatcher('f');
    assert.ok(suggest.suggestion.matched.length === 1);
    suggest.suggestion.setMatcher('ba');
    assert.ok(suggest.suggestion.matched.length === 2);
    suggest.suggestion.setMatcher('baz');
    assert.ok(suggest.suggestion.matched.length === 1);
  });

  it('return selected suggestion', function() {
    let input = document.createElement('input');
    let suggest = new InputSuggest(input, ['foo', 'bar', 'baz']);
    suggest.popup.selectedIndex = 0;
    assert.ok(suggest.popup.selectedItem === 'foo');
    suggest.popup.selectedIndex = 1;
    assert.ok(suggest.popup.selectedItem === 'bar');
    suggest.popup.selectedIndex = 2;
    assert.ok(suggest.popup.selectedItem === 'baz');
  });
});
