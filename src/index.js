require("babel/polyfill");

const TextArea   = require('./textarea');
const Suggestion = require('./suggestion');

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
    this.text       = '';

    this.textArea.on('input', input => {

      if (this.suggestion.isShown) {
        if (this.textArea.isDeleted && this.text.length !== 0) {
          this.text = this.text.substring(0, this.text.length - 1);
        } else {
          this.text += input;
        }
      } else {
        this.text = input;
      }

      this.suggestion.setMatcher(this.text);

      if (this.text.length !== 0 && this.suggestion.matchedItems.length !== 0) {
        let position = this.textArea.popupPosition;
        this.suggestion.prepareItems();
        this.suggestion.show(position.top, position.left);
      } else {
        this.suggestion.hide();
      }
    });

    this.textArea.on('enter', e => {
      if (this.suggestion.isSelected) {
        e.preventDefault();
        this.textArea.insert(this.text, this.suggestion.selectedItem);
      }
      this.suggestion.hide();
    });

    this.textArea.on('up', e => {
      if (this.suggestion.isShown) {
        e.preventDefault();
        if (this.suggestion.selectedIndex > 0) {
          this.suggestion.selectedIndex--;
        }
        this.suggestion.highlight();
      }
    });

    this.textArea.on('down', e => {
      if (this.suggestion.isShown) {
        e.preventDefault();
        if (this.suggestion.selectedIndex < this.suggestion.matchedItems.length - 1) {
          this.suggestion.selectedIndex++;
        }
        this.suggestion.highlight();
      }
    });

    this.suggestion.on('click', e => {
      this.textArea.insert(this.text, e.target.getAttribute('data-suggestion'));
      this.suggestion.hide();
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
