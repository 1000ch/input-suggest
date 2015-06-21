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
    let inputSuggest = new InputSuggest(document.createElement('input'), ['foo', 'bar', 'baz']);
    inputSuggest.suggestion.setMatcher('a');
    assert.ok(inputSuggest.suggestion.matchedItems.length === 2);
    inputSuggest.suggestion.setMatcher('f');
    assert.ok(inputSuggest.suggestion.matchedItems.length === 1);
    inputSuggest.suggestion.setMatcher('ba');
    assert.ok(inputSuggest.suggestion.matchedItems.length === 2);
    inputSuggest.suggestion.setMatcher('baz');
    assert.ok(inputSuggest.suggestion.matchedItems.length === 1);
  });

  it('return selected suggestion', function() {
    let inputSuggest = new InputSuggest(document.createElement('input'), ['foo', 'bar', 'baz']);
    inputSuggest.suggestion.selectedIndex = 0;
    assert.ok(inputSuggest.suggestion.selectedItem === 'foo');
    inputSuggest.suggestion.selectedIndex = 1;
    assert.ok(inputSuggest.suggestion.selectedItem === 'bar');
    inputSuggest.suggestion.selectedIndex = 2;
    assert.ok(inputSuggest.suggestion.selectedItem === 'baz');
  });
});
