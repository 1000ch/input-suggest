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
    this.textareaFontSize = this.textareaStyle['font-size'].replace(/(px)/, '') - 0;
    this.container = null;
    this.list = [];

    this.setSuggestion(suggestions);

    this.selectionStart = 0;
    this.selectionEnd   = 0;

    textarea.addEventListener('input', this.onInput.bind(this));

    textarea.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  get isSelected() {
    return this.isShown && this.selectedIndex !== -1;
  }

  get isShown() {
    return this.container.classList.contains('is-shown');
  }

  onInput(e) {
    this.selectionStart = e.target.selectionStart;
    this.selectionEnd  = e.target.selectionEnd;
    let inputText = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);
    if (this.suggestions.every(suggestion => suggestion.substring(0, 1) !== inputText)) {
      this.container.style.display = 'none';
      return;
    }
    this.showPopup();
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case 13:
        if (this.isSelected) {
          e.preventDefault();
          let suggestion = this.suggestions[this.selectedIndex];
          this.insertSuggestion(suggestion);
        }
        this.hidePopup();
        break;
      case 38:
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        }
        if (this.isShown) {
          e.preventDefault();
          this.highlightSelectedIndex();
        }
        break;
      case 40:
        if (this.selectedIndex < this.suggestions.length - 1) {
          this.selectedIndex++;
        }
        if (this.isShown) {
          e.preventDefault();
          this.highlightSelectedIndex();
        }
        break;
      default:
        this.hidePopup();
        break;
    }
  }

  highlightSelectedIndex() {
    for (let item of this.list) {
      item.classList.remove('is-selected');
    }
    this.list[this.selectedIndex].classList.add('is-selected');
  }

  setSuggestion(suggestions = []) {

    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    this.suggestions.length = 0;
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
      this.container.className = 'suggestion';
      this.container.style.position = 'absolute';
      this.container.style.display = 'none';
      this.container.style.listStyle = 'none';
    }

    this.list.length = 0;
    this.container.innerHTML = '';

    const onClick = e => {
      this.insertSuggestion(e.target.textContent);
      this.hidePopup();
    }

    for (let suggestion of this.suggestions) {
      let item = document.createElement('li');
      item.className = 'suggestion__item';
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

  get popupPosition() {
    let coordinates = getCaretCoordinates(this.textarea, this.textarea.selectionEnd);
    return {
      top: this.textarea.offsetTop + coordinates.top,
      left: this.textarea.offsetLeft + coordinates.left
    }
  }

  showPopup() {
    let position = this.popupPosition;
    this.container.style.top = position.top + this.textareaFontSize + 'px';
    this.container.style.left = position.left + 'px';
    this.container.style.display = 'block';

    this.container.classList.add('is-shown');
  }

  hidePopup() {
    this.container.style.display = 'none';
    this.selectedIndex = -1;

    this.container.classList.remove('is-shown');
    for (let item of this.list) {
      item.classList.remove('is-selected');
    }
  }
}

export default TextareaSuggestion;
