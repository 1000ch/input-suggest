const getCaretCoordinates = require('textarea-caret-position/index.js');

class TextareaSuggestion {

  constructor(textarea, suggestions) {

    if (!textarea) {
      throw new Error('Invalid element');
    }

    if (typeof textarea === 'string') {
      textarea = document.querySelector(textarea);
    }

    this.selectedIndex = -1;
    this.suggestions = [];
    this.textarea  = textarea;
    this.textareaStyle = getComputedStyle(this.textarea)
    this.textareaFontSize = this.textareaStyle['font-size'].replace('px', '') - 0;
    this.container = null;
    this.list = [];

    this.setSuggestion(suggestions);

    this.selectionStart = 0;
    this.selectionEnd   = 0;

    textarea.addEventListener('input', e => {
      this.selectionStart = e.target.selectionStart;
      this.selectionEnd  = e.target.selectionEnd;
      let inputText = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);
      if (this.suggestions.every(suggestion => suggestion.substring(0, 1) !== inputText)) {
        this.container.style.display = 'none';
        return;
      }
      this.showPopup();
    });

    textarea.addEventListener('keydown', e => {

      switch (e.keyCode) {
        case 13:
          if (this.container.style.display === 'block') {
            e.preventDefault();
            let suggestion = this.suggestions[this.selectedIndex];
            this.insertSuggestion(suggestion);
            this.hidePopup();
          }
          break;
        case 38:
          if (this.selectedIndex > 0) {
            this.selectedIndex--;
          }
          break;
        case 40:
          if (this.selectedIndex < this.suggestions.length - 1) {
            this.selectedIndex++;
          }
          break;
        default:
          this.hidePopup();
          break;
      }

      if (this.container.style.display === 'block') {
        e.preventDefault();
        for (let item of this.list) {
          item.style.background = 'white';
        }
        this.list[this.selectedIndex].style.background = 'red';
      }
    });
  }

  setSuggestion(suggestions = []) {

    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    for (let suggestion of suggestions) {
      if (typeof suggestion === 'string') {
        this.suggestions.push(suggestion);
      }
    }

    this.prepareSuggestionPopup();
  }

  prepareSuggestionPopup() {

    if (this.container == null) {
      this.container = document.createElement('ul');
      this.container.style.position = 'absolute';
      this.container.style.display = 'none';
      this.container.style.listStyle = 'none';
      this.container.style.border = '1px solid #ccc';
    }

    this.list.length = 0;
    this.container.innerHTML = '';

    const onClick = e => {
      this.insertSuggestion(e.target.textContent);
      this.hidePopup();
    }

    for (let suggestion of this.suggestions) {
      let item = document.createElement('li');
      item.textContent = suggestion;
      item.addEventListener('click', onClick);
      this.list.push(item);
      this.container.appendChild(item);
    }

    document.body.appendChild(this.container);
  }

  insertSuggestion(suggestion) {
    this.textarea.setSelectionRange(this.selectionEnd - 1, this.selectionEnd);
    this.textarea.setRangeText(suggestion);
    let caretIndex = this.selectionEnd + suggestion.length;
    this.textarea.setSelectionRange(caretIndex, caretIndex);
  }

  showPopup() {
    let coordinates = getCaretCoordinates(this.textarea, this.textarea.selectionEnd);
    let top = this.textarea.offsetTop + coordinates.top;
    let left = this.textarea.offsetLeft + coordinates.left;
    this.container.style.top = top + this.textareaFontSize + 'px';
    this.container.style.left = left + 'px';
    this.container.style.display = 'block';
  }

  hidePopup() {
    this.container.style.display = 'none';
    for (let item of this.list) {
      item.style.background = 'white';
    }
    this.selectedIndex = -1;
  }
}

export default TextareaSuggestion;
