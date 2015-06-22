require("babel/polyfill");

const TextArea   = require('./textarea');
const Suggestion = require('./suggestion');
const Popup      = require('./popup');

class InputSuggest {

  constructor(textarea, suggestions) {

    if (!textarea) {
      throw new Error('Invalid argument');
    }

    if (typeof textarea === 'string') {
      textarea = document.querySelector(textarea);
    }

    this.textArea   = new TextArea(textarea);
    this.suggestion = new Suggestion(suggestions);
    this.popup      = new Popup(suggestions);
    this.text       = '';

    this.textArea.on('input', input => {

      if (this.popup.isShown) {
        if (this.textArea.isDeleted && this.text.length !== 0) {
          this.text = this.text.substring(0, this.text.length - 1);
        } else {
          this.text += input;
        }
      } else {
        this.text = input;
      }

      this.suggestion.setMatcher(this.text);

      if (this.text.length !== 0 && this.suggestion.matched.length !== 0) {
        this.popup.position = this.textArea.popupPosition
        this.popup.setSuggestions(this.suggestion.matched);
        this.popup.show();
      } else {
        this.popup.hide();
      }
    });

    this.textArea.on('enter', e => {
      if (this.popup.isSelected) {
        e.preventDefault();
        this.textArea.insert(this.text, this.popup.selectedItem);
      }
      this.popup.hide();
    });

    this.textArea.on('up', e => {
      if (this.popup.isShown) {
        e.preventDefault();
        if (this.popup.selectedIndex > 0) {
          this.popup.selectedIndex--;
        }
        this.popup.show();
      }
    });

    this.textArea.on('down', e => {
      if (this.popup.isShown) {
        e.preventDefault();
        if (this.popup.selectedIndex < this.popup.suggestions.length - 1) {
          this.popup.selectedIndex++;
        }
        this.popup.show();
      }
    });

    this.popup.on('click', e => {
      this.textArea.insert(this.text, e.target.getAttribute('data-suggestion'));
      this.popup.hide();
    });
  }

  setSuggestions(suggestions) {
    this.suggestion.setSuggestions(suggestions);
  }
}

if (module !== undefined && module.exports !== undefined) {
  module.exports = InputSuggest;
} else {
  window.InputSuggest = InputSuggest;
}
