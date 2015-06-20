const EventEmitter = require('events').EventEmitter;
const getCaret     = require('textarea-caret-position/index.js');

const VK_DELETE = 8;
const VK_ENTER  = 13;
const VK_UP     = 38;
const VK_DOWN   = 40;

export default class Textarea extends EventEmitter {

  constructor(textarea) {
    super();

    this.textarea = textarea;
    this.style    = getComputedStyle(textarea);

    this.selectionStart = 0;
    this.selectionEnd   = 0;
    this.inputText      = '';
    this.lastInputText  = '';
    this.isDeleted      = false;

    textarea.addEventListener('input', this.onInput.bind(this));
    textarea.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  get fontSize() {
    return Number(this.style['font-size'].replace(/(px)/, ''));
  }

  get position() {
    return {
      top: this.textarea.offsetTop,
      left: this.textarea.offsetLeft
    }
  }

  get popupPosition() {
    let textarea = this.position;
    let caret    = getCaret(this.textarea, this.textarea.selectionEnd);
    return {
      top: textarea.top + caret.top + this.fontSize,
      left: textarea.left + caret.left
    };
  }

  insert(text) {
    this.textarea.setSelectionRange(this.selectionEnd - this.inputText.length, this.selectionEnd);
    this.textarea.setRangeText(text);
    let caretIndex = this.selectionEnd + text.length;
    this.textarea.setSelectionRange(caretIndex, caretIndex);
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

    this.emit('input', this.inputText);
  }

  onKeyDown(e) {
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
}
