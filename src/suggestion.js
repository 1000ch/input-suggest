const EventEmitter = require('events').EventEmitter;

export default class Suggestion extends EventEmitter {

  constructor(suggestions = []) {
    super();

    this.suggestions   = [];
    this.setSuggestions(suggestions);

    this.matcher       = '';
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

  setMatcher(matcher) {
    this.matcher = matcher;
  }

  get matched() {
    return this.suggestions.filter(suggestion => suggestion.indexOf(this.matcher) !== -1);
  }
}
