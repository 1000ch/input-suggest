const h              = require('virtual-dom/h');
const diff           = require('virtual-dom/diff');
const patch          = require('virtual-dom/patch');
const createElement  = require('virtual-dom/create-element');

const assign         = require('object-assign');
const Delegate       = require('dom-delegate').Delegate;
const EventEmitter   = require('events').EventEmitter;

export default class Popup extends EventEmitter {

  constructor(suggestions) {
    super();

    this.suggestions   = [];
    this.selectedIndex = -1;
    this.position = {
      top: 0,
      left: 0
    };

    this.setSuggestions(suggestions);

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
    this.suggestions = suggestions;
  }

  createTree(style = {}, isShown = false) {
    return h('ul', {
      className: isShown ? 'suggestion is-shown': 'suggestion',
      style: assign({
        position: 'absolute',
        top: `${this.position.top}px`,
        left: `${this.position.left}px`,
        display: 'none',
        listStyle: 'none'
      }, style)
    }, this.suggestions.map((suggestion, index) => {
      return h('li', {
        className: (index === this.selectedIndex) ? 'suggestion__item is-selected': 'suggestion__item',
        dataset: {
          suggestion: suggestion
        }
      }, [suggestion]);
    }));
  }

  renderTree(style, isShown) {
    let tree    = this.createTree(style, isShown);
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
    this.renderTree({});
  }

  onClick(e) {
    this.emit('click', e);
  }
}
