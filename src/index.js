require('string.prototype.startswith');

const Textarea   = require('./textarea');
const Suggestion = require('./suggestion');

class TextareaSuggestion {

  constructor(textarea, suggestions) {

    if (!textarea) {
      throw new Error('Invalid element');
    }

    if (typeof textarea === 'string') {
      textarea = document.querySelector(textarea);
    }

    this.textarea   = new Textarea(textarea);
    this.suggestion = new Suggestion(suggestions);

    this.textarea.on('input', (inputText) => {
      this.suggestion.setMatcher(inputText);

      if (inputText.length !== 0 && this.suggestion.matched.length !== 0) {
        this.suggestion.prepareItems();
        let position = this.textarea.popupPosition;
        this.suggestion.show(position.top, position.left);
      } else {
        this.suggestion.hide();
      }
    });

    this.textarea.on('enter', (e) => {
      if (this.suggestion.isSelected) {
        e.preventDefault();
        this.textarea.insert(this.suggestion.selected);
      }
      this.suggestion.hide();
    });

    this.textarea.on('up', (e) => {
      if (this.suggestion.isShown) {
        e.preventDefault();
        if (this.suggestion.selectedIndex > 0) {
          this.suggestion.selectedIndex--;
        }
        this.suggestion.highlight();
      }
    });

    this.textarea.on('down', (e) => {
      if (this.suggestion.isShown) {
        e.preventDefault();
        if (this.suggestion.selectedIndex < this.suggestion.matched.length - 1) {
          this.suggestion.selectedIndex++;
        }
        this.suggestion.highlight();
      }
    });
  }

  setSuggestions(suggestions) {
    this.suggestion.setSuggestions(suggestions);
  }
}

export default TextareaSuggestion;
