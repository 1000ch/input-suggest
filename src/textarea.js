const EventEmitter = require('events').EventEmitter;
const getCaret     = require('textarea-caret-position/index.js');

const VK_DELETE = 8;
const VK_ENTER  = 13;
const VK_UP     = 38;
const VK_DOWN   = 40;

export default class TextArea extends EventEmitter {

  constructor(textarea) {
    super();

    this.textarea = textarea;
    this.style    = getComputedStyle(textarea);

    this.selectionStart = 0;
    this.selectionEnd   = 0;
    this.input          = '';
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

  insert(match, text) {
    let caretIndex = this.selectionEnd + text.length;
    this.textarea.setSelectionRange(this.selectionEnd - match.length, this.selectionEnd);
    this.textarea.setRangeText(text);
    this.textarea.setSelectionRange(caretIndex, caretIndex);
  }

  onInput(e) {
    this.selectionStart = e.target.selectionStart;
    this.selectionEnd   = e.target.selectionEnd;

    if (this.isDeleted) {
      this.input = '';
    } else {
      this.input  = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);
    }

    this.emit('input', this.input);
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
