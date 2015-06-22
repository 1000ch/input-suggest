const h             = require('virtual-dom/h');
const diff          = require('virtual-dom/diff');
const patch         = require('virtual-dom/patch');
const createElement = require('virtual-dom/create-element');

const Delegate      = require('dom-delegate').Delegate;
const EventEmitter  = require('events').EventEmitter;

export default class Popup extends EventEmitter {

  constructor() {
    super();

    this.container     = null;
    this.delegate      = null;
    this.items         = [];

    this.selectedIndex = -1
    this.prepare();
  }

  get isSelected() {
    return this.isShown && this.selectedIndex !== -1;
  }

  get isShown() {
    return this.container.classList.contains('is-shown');
  }

  get selectedItem() {
    return this.items[this.selectedIndex];
  }

  prepare() {
    if (this.container == null) {
      this.container = document.createElement('ul');
      this.container.className = 'suggestion';
      this.container.style.position = 'absolute';
      this.container.style.display = 'none';
      this.container.style.listStyle = 'none';
      document.body.appendChild(this.container);

      this.delegate = new Delegate(this.container);
      this.delegate.on('click', 'li', this.onClick.bind(this));
    }
  }

  render(suggestions) {

    this.items.length = 0;
    this.container.innerHTML = '';

    for (let suggestion of suggestions) {
      let item = document.createElement('li');
      item.className = 'suggestion__item';
      item.textContent = suggestion;
      item.setAttribute('data-suggestion', suggestion);
      this.items.push(item);
      this.container.appendChild(item);
    }
  }

  show(top, left) {
    this.container.style.top     = top + 'px';
    this.container.style.left    = left + 'px';
    this.container.style.display = 'block';
    this.container.classList.add('is-shown');
  }

  hide() {
    this.container.style.display = 'none';
    this.selectedIndex           = -1;
    this.container.classList.remove('is-shown');
    for (let item of this.items) {
      item.classList.remove('is-selected');
    }
  }

  highlight() {
    for (let item of this.items) {
      item.classList.remove('is-selected');
    }
    this.items[this.selectedIndex].classList.add('is-selected');
  }

  onClick(e) {
    this.emit('click', e);
  }
}
