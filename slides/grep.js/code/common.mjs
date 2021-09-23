export function makeRegex(regexStr) {
  try {
    return new RegExp(regexStr);
  }
  catch (err) {
    return null;
  }
}

//not used.
//illustrates start of error architecture and defining JS getters
class AppError {
  constructor(msg, options={}) {
    Object.assign(this, { _msg: msg, _options: options });
    this.freeze();
  }

  get code() { return this._options.code || ''; }
  get coord() { return this._options.coord || null; }
  get klass() { return this._options.klass || ''; }

  toString() {
    const prefix = [ 'coord', 'klass', 'code' ]
      .map(k => this[k] ? `${this[k]}: ` : '').join('');
    return `${prefix}${this._msg}`;
  }
}


