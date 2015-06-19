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

  onInput(e) {
    this.selectionStart = e.target.selectionStart;
    this.selectionEnd   = e.target.selectionEnd;
    this.lastInputText  = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);

    if (this.isShown && !this.isDeleted) {
      this.inputText += this.lastInputText;
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

  get matchedSuggestions() {
    return this.suggestions.filter(suggestion => suggestion.startsWith(this.inputText));
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case 8://del
        if (this.isShown) {
          let lastIndex = this.inputText.lastIndexOf(this.lastInputText);
          this.inputText = this.inputText.substring(0, lastIndex);
          this.isDeleted = true;
        }
        break;
      case 13://enter
        if (this.isSelected) {
          e.preventDefault();
          let suggestion = this.matchedSuggestions[this.selectedIndex];
          this.insertSuggestion(suggestion);
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
        if (this.isShown) {
          this.isDeleted = false;
        } else {
          this.hidePopup();
        }
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

  onClick(e) {
    this.insertSuggestion(e.target.textContent);
    this.hidePopup();
  }

  prepareItems() {

    this.list.length = 0;
    this.container.innerHTML = '';

    for (let suggestion of this.matchedSuggestions) {
      let item = document.createElement('li');
      item.className = 'suggestion__item';
      item.textContent = suggestion;
      item.addEventListener('click', this.onClick.bind(this));
      this.list.push(item);
      this.container.appendChild(item);
    }
  }

  insertSuggestion(suggestion) {
    this.textarea.setSelectionRange(this.selectionEnd - this.inputText.length, this.selectionEnd);
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
