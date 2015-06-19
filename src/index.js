require('string.prototype.startswith');

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
    this.prepareContainer();

    this.selectionStart = 0;
    this.selectionEnd   = 0;
    this.inputText      = '';
    this.lastInputText  = '';
    this.isDeleted      = false;

    textarea.addEventListener('input', this.onInput.bind(this));
    textarea.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  get isSelected() {
    return this.isShown && this.selectedIndex !== -1;
  }

  get isShown() {
    return this.container.classList.contains('is-shown');
  }

  get matchedSuggestions() {
    return this.suggestions.filter(suggestion => suggestion.startsWith(this.inputText));
  }

  get selectedSuggestion() {
    return this.matchedSuggestions[this.selectedIndex];
  }

  onInput(e) {
    this.selectionStart = e.target.selectionStart;
    this.selectionEnd   = e.target.selectionEnd;

    if (this.isDeleted) {
      this.lastInputText = '';
    } else {
      this.lastInputText  = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);
    }

    if (this.isShown) {
      if (this.isDeleted && this.inputText.length !== 0) {
        this.inputText = this.inputText.substring(0, this.inputText.length - 1);
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

  onKeyDown(e) {
    switch (e.keyCode) {
      case 8://del
        this.isDeleted = true;
        break;
      case 13://enter
        if (this.isSelected) {
          e.preventDefault();
          this.insertText(this.selectedSuggestion);
        }
        this.hidePopup();
        break;
      case 38://up
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        }
        if (this.isShown) {
          e.preventDefault();
          this.highlightSelectedIndex();
        }
        break;
      case 40://down
        if (this.selectedIndex < this.matchedSuggestions.length - 1) {
          this.selectedIndex++;
        }
        if (this.isShown) {
          e.preventDefault();
          this.highlightSelectedIndex();
        }
        break;
      default:
        this.isDeleted = false;
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
  }

  prepareContainer() {
    if (this.container == null) {
      this.container = document.createElement('ul');
      this.container.className = 'suggestion';
      this.container.style.position = 'absolute';
      this.container.style.display = 'none';
      this.container.style.listStyle = 'none';
      document.body.appendChild(this.container);
    }
  }

  onSuggestionClick(e) {
    this.insertText(e.target.textContent);
    this.hidePopup();
  }

  prepareItems() {

    this.list.length = 0;
    this.container.innerHTML = '';

    for (let suggestion of this.matchedSuggestions) {
      let item = document.createElement('li');
      item.className = 'suggestion__item';
      item.textContent = suggestion;
      item.addEventListener('click', this.onSuggestionClick.bind(this));
      this.list.push(item);
      this.container.appendChild(item);
    }
  }

  insertText(text) {
    this.textarea.setSelectionRange(this.selectionEnd - this.inputText.length, this.selectionEnd);
    this.textarea.setRangeText(text);
    let caretIndex = this.selectionEnd + text.length;
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
