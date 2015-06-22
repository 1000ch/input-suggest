const EventEmitter = require('events').EventEmitter;
const getCaret     = require('textarea-caret-position');

const VK_DELETE = 8;
const VK_ENTER  = 13;
const VK_UP     = 38;
const VK_DOWN   = 40;

export default class TextArea extends EventEmitter {

  constructor(textarea) {
    super();

    this.textarea       = textarea;
    this.style          = getComputedStyle(textarea);

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

  get popupPosition() {
    let top   = this.textarea.offsetTop;
    let left  = this.textarea.offsetLeft;
    let caret = getCaret(this.textarea, this.textarea.selectionEnd);
    return {
      top: top + caret.top + this.fontSize,
      left: left + caret.left
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
      this.input = this.textarea.value.substring(this.selectionEnd - 1, this.selectionEnd);
    }

    this.emit('input', this.input);
  }

  onKeyDown(e) {
    switch (e.keyCode) {
      case VK_DELETE:
        this.isDeleted = true;
        this.emit('delete', e);
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
