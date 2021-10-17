
import { AppErrors } from 'cs544-js-utils';
export class AppError {

  constructor(msg, options={}) {
    this._msg = msg;
    this._options = options;
    Object.freeze(this);
  }

  get message() {
    const codePrefix =
        (this.code) ? `${this._options.code}: ` : '';
    return `${codePrefix}${this._msg}`;
  }

  get options() { return this._options; }

  get code() { return this._options.code ?? ''; }
  get widget() { return this._options.widget ?? ''; }

}


//30 days has September, April, June and November
const MONTHS_30 = new Set([9, 4, 6, 11]);
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

/** Returns incoming YYYY-MM-DD date yyyymmdd or an errors object */
export function getDate(yyyymmdd, errors=new AppErrors()) {
  const [ _, yyyy, mm, dd ] =
  yyyymmdd?.trim()?.match(/^(\d{4})-(\d\d)-(\d\d)$/) ?? [];
  if (dd) {
    const [ year, month, day ] =  [ Number(yyyy), Number(mm), Number(dd) ];
    const isBadDate =
        day < 1 || month < 1 || month > 12 ||
        day > (MONTHS_30.has(month) ? 30 : 31) ||
        (month === 2 && day > (isLeapYear(year) ? 29 : 28));
    if (!isBadDate) return yyyymmdd;
  }
  return errors.add(`bad date "${yyyymmdd}"`, { code: 'BAD_REQ'});
}

/** If intStr is an integer of one or more digits, then return it as a
 *  Number; otherwise return a suitable errors object.
 */
export function getPositiveInt(intStr, errors=new AppErrors()) {
  return (intStr?.trim?.().match(/^\d+$/) && Number(intStr) > 0)
      ? Number(intStr)
      : errors.add(`bad value "${intStr}": must be a positive integer`,
          { code: 'BAD_REQ' });
}

/** If numStr looks like a number with 2 digits after the decimal
 *  point, then return integer cents; otherwise return a suitable errors
 *  object.
 */
export function getCents(numStr, errors=new AppErrors()) {
  return (numStr?.trim().match(/^[-+]?\d+\.\d\d$/))
      ? Number(numStr.replace('.', ''))
      : errors.add(`bad amount "${numStr}": must be number with 2 decimals`,
          { code: 'BAD_REQ' });
}


/** Returns a new id which is unique and hard to guess */
export const genId = (() => {
  const RAND_LEN = 2;
  let seq = 0;
  return () => String(seq++ + Number(Math.random().toFixed(RAND_LEN)));
})();


