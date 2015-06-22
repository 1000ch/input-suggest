const h             = require('virtual-dom/h');
const diff          = require('virtual-dom/diff');
const patch         = require('virtual-dom/patch');
const createElement = require('virtual-dom/create-element');

const assign        = require('object-assign');
const Delegate      = require('dom-delegate').Delegate;
const EventEmitter  = require('events').EventEmitter;

export default class Popup extends EventEmitter {

  constructor(suggestions = []) {
    super();

    this.suggestions = [];
    this.setSuggestions(suggestions);

    this.selectedIndex = -1;
    this.position = {
      top: 0,
      left: 0
    };

    this.tree = this.createTree();
    this.root = createElement(this.tree);
    this.delegate = new Delegate(this.root);
    this.delegate.on('click', 'li', this.onClick.bind(this));

    document.body.appendChild(this.root);
  }

  get isSelected() {
    return this.isShown && this.selectedIndex !== -1;
  }

  get isShown() {
    return this.root.classList.contains('is-shown');
  }

  get selectedItem() {
    return this.suggestions[this.selectedIndex];
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

  createTree(style = {}, shown = false) {

    let items = this.suggestions.map((suggestion, index) => {

      let className = 'suggestion__item';
      if (index === this.selectedIndex) {
        className += ' is-selected';
      }

      return h('li', {
        className: className,
        dataset: {
          suggestion: suggestion
        }
      }, [suggestion]);
    });

    style = assign({
      position: 'absolute',
      top: `${this.position.top}px`,
      left: `${this.position.left}px`,
      display: 'none',
      listStyle: 'none'
    }, style);

    let className = 'suggestion';
    if (shown) {
      className += ' is-shown'
    }

    return h('ul', {
      className: className,
      style: style
    }, items);
  }

  renderTree(style, shown) {
    let tree    = this.createTree(style, shown);
    let patches = diff(this.tree, tree);
    this.root   = patch(this.root, patches);
    this.tree   = tree;
  }

  show() {
    this.renderTree({
      display: 'block'
    }, true);
  }

  hide() {
    this.selectedIndex = -1;
    this.renderTree({}, false);
  }

  onClick(e) {
    this.emit('click', e);
  }
}
