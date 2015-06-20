const EventEmitter = require('events').EventEmitter;

export default class Suggestion extends EventEmitter {

  constructor(suggestions) {
    super();

    this.selectedIndex = -1;
    this.suggestions   = [];
    this.container     = null;
    this.list          = [];
    this.matcher       = '';

    this.setSuggestions(suggestions);
    this.prepareContainer();
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

  prepareItems() {
    this.list.length = 0;
    this.container.innerHTML = '';

    for (let suggestion of this.matched) {
      let item = document.createElement('li');
      item.className = 'suggestion__item';
      item.textContent = suggestion;
      item.addEventListener('click', this.onClick.bind(this));
      this.list.push(item);
      this.container.appendChild(item);
    }
  }

  setMatcher(matcher) {
    this.matcher = matcher;
  }

  setSuggestions(suggestions = []) {
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

  get isSelected() {
    return this.isShown && this.selectedIndex !== -1;
  }

  get isShown() {
    return this.container.classList.contains('is-shown');
  }

  get matched() {
    return this.suggestions.filter(suggestion => suggestion.indexOf(this.matcher) !== -1);
  }

  get selected() {
    return this.matched[this.selectedIndex];
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
    for (let item of this.list) {
      item.classList.remove('is-selected');
    }
  }

  highlight() {
    for (let item of this.list) {
      item.classList.remove('is-selected');
    }
    this.list[this.selectedIndex].classList.add('is-selected');
  }

  onClick(e) {
    this.emit('click', e);
  }
}
