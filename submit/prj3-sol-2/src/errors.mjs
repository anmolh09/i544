/** An error is either an Error, an AppError or a list AppErrors of
 *  AppError.
 *
 *  All classes below are immutable.
 */

export class AppError extends Error {

  constructor(msg, options={}) {
    super(msg);
    this.name = 'AppError';
    this.options = options;
    Object.freeze(this);
  }

  toString() {
    const codePrefix =
      this.options.code ? `${this.options.code}: ` : '';
    return `${codePrefix}${this.message}`;
  }

}

/** Immutable instance holds list of AppError's */
class AppErrors {
  constructor(errors=[]) {
    this.errors = errors;
    Object.freeze(errors);
    Object.freeze(this);
  }
  add(err, options={}) {
    if (err instanceof AppError) { //must be before instanceof Error test
      return new AppErrors(this.errors.concat(err));
    }
    else if (err instanceof Error) {
      return new AppErrors(this.errors.concat(new AppError(err.message)));
    }
    else if (err instanceof AppErrors) {
      const errors = this.errors.concat(err.errors);
      return new AppErrors(this.errors.concat(err.errors));
    }
    else {
      const appError = new AppError(err.toString(), options);
      return new AppErrors(this.errors.concat(appError));
    }
  }
  toString() { return this.errors.map(e => e.toString()).join('\n'); }
    
  
  // toString() {
  //   return this.errors.length > 0
  //     ? this.errors.map(e => e.toString()).join('\n') + '\n'
  //     : '';
  // }
}

/** Immutable instance holds either a list of AppErrors errors or a
 *  result. 
 *
 *  Possible to chain function calls producing Result's using
 *  andThen(), orElse() with the andThen() short-circuiting on error
 *  (similar to then() and catch() on a Promise).  If a function is
 *  async, then use asyncAndThen() and asyncOrElse() (which return
 *  Promise<Result>).  Example of chaining Result functions in
 *  ../test/errors.mjs
 */ 
class Result {

  constructor(val=null) {
    if (val instanceof Error || val instanceof AppError) {
      val = new AppErrors().add(val);
    }
    this._val = val;
    Object.freeze(this);
  };

  /** returns true iff this is not in error */
  get isOk() { return !(this._val instanceof AppErrors); }

  /** returns wrapped value; will be instanceof AppErrors if this
   *  result is in error.
   */
  get val() { return this._val; }

  /** if this is in error, then simply return this; 
   *
   *  if argsFn is simply a function fn and the value wrapped by
   *  this is val, then return wrapped result of fn(val).
   *
   *  otherwise assume argsFn is [...args, fn] and the value wrapped
   *  by this is val, then return wrapped result of fn(val, ...args).
   */
  andThen(...argsFn) { return this._doSync(true, ...argsFn); }

  /** like andThen() except that it returns this if it is *not*
   *  in error.
   */
  orElse(...argsFn) { return this._doSync(false, ...argsFn); }

  /** like andThen() except that it returns a Promise<Result> */
  async asyncAndThen(...argsFn) { return await this._doAsync(true, ...argsFn); }

  /** like orElse() except that it returns a Promise<Result> */
  async asyncOrElse(...argsFn) { return await this._doAsync(false, ...argsFn); }

  
  /** factory method to return a new successful Result wrapping val */
  static ok(val) {
    console.assert(!(val instanceof Error || val instanceof AppError ||
		     val instanceof AppErrors));
    return new Result(val);
  }

  /** return a new Result which is in error with err and options */
  static error(err, options={}) {
    const errors = new AppErrors().add(err, options);
    return new Result(errors);
  }

  /** Like Promise.all(): if all wrapped results are ok, then return
   *  Result which wraps array of values; otherwise return a error Result
   *  containing the errors in results.
   */
  static all(results) {
    const bad = results.filter(res => !res.isOk);
    if (bad.length === 0) {
      return new Result(results.map(result => result.val));
    }
    else {
      let errors = new AppErrors();
      bad.forEach(res => errors = errors.add(res.val));
      return new Result(errors);
    }
  }

  _doSync(isOk, ...argsFn) {
    const args = argsFn.slice(0, -1);
    const fn = argsFn.slice(-1)[0];
    if (this.isOk !== isOk) {
      return this;
    }
    else {
      try {
	const val = fn.call(this, this._val, ...args);
	return (val instanceof Result) ? val : new Result(val);
      }
      catch (err) {
	return new Result(new AppErrors().add(err.toString()));
      }
    }
  }
  
  async _doAsync(isOk, ...argsFn) {
    const args = argsFn.slice(0, -1);
    const fn = argsFn.slice(-1)[0];
    if (this.isOk !== isOk) {
      return this;
    }
    else {
      try {
	const val = await fn.call(this, this._val, ...args);
	if ((val instanceof Error) || (val instanceof AppError) ||
	    (val instanceof AppErrors)) {
	  throw val;
	}
	return (val instanceof Result) ? val : new Result(val);
      }
      catch (err) {
	//_doAsync returns Promise; by throwing we propagate
	//failed Result until caught by catch().
	throw new Result(new AppErrors().add(err));
      }
    }
  }
  
}

export default { AppError, AppErrors, Result };
