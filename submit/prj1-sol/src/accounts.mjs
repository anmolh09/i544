import { AppErrors } from 'cs544-js-utils';

import { getDate, getPositiveInt, getCents, genId } from './util.mjs';

/**
API to maintain bank accounts.  The API data model includes the
following entities:

  Account Holder: External to this API.  Simply represented by an
  externally generated opaque holderId ID.

  Account: Identified by an ID (generated within this API).  Will
  track its holder using the holderId ID.  It will also contain a
  collection of transactions.

  Transaction: Contains

     { id, amount, date, memo } 

  where id is the transaction ID (generated within this API), amount
  is a Number giving the amount of the transaction (>= 0 for deposits,
  < 0 for withdrawals), date is a YYYY-MM-DD String giving the date
  of the transaction and memo is a String describing the transaction.

  Note that the API uses the word 'act' to refer to a transaction.

Our data model makes the following simplifying assumptions:

  + Each account has only a single holder; i.e. there are no
    "joint accounts."

  + Each account has an infinite overdraft; i.e. the balance can
    be negative without limit.

The params argument to API methods is an object specifying values for
the method parameters.  Note that the value of all parameters must be
String's.

Since most API methods operate on an individual account, the `params`
object usually contains an `id` property identifying the relevant
account.

All API methods return errors by returning an object having an errors
property specifying a list of error objects.  Each error is a object

  { message, options? } 

where message is a String specifying the error message and optional
options is an object.  In particular, options can specify property
'code' which is a String giving an error code.

Less verbosely, errors are returned as an object:

  { errors: [ { message: String, options?: { code?: String, ...} } ] } 

where { } indicates an object, [ ] indicates a list/array and ?
indicates optional.

The API documentation specifies errors by code.
  
*/

const DEFAULT_COUNT = 5;

export default function makeAccounts() {
  return new Accounts();
}
makeAccounts.DEFAULT_COUNT = DEFAULT_COUNT; //for testing


class Accounts {
  constructor() {
    //TODO
        this._accounts =[]
  }

  /** Return ID of a newly created account having holder ID set to
   *  params.holderId and zero balance.  When called, params must
   *  specify holderId.
   *  
   *  Error Codes: 
   *    BAD_REQ:     holderId not specified.
   */
  newAccount(params={}) {
    //TODO
    if(!params.holderId){
      let errors = new AppErrors();
      errors.add("holderId not specified",{ 'code' : 'BAD_REQ'})
      return errors ;
    }
    let newAccount = new Account( genId() , params.holderId ,0)
    // console.log('newAccount.info()',newAccount.info());
    this._accounts.push(newAccount);

    // let returnedAccount = this._accounts.filter ( e => newAccount.id === e.id)
    // console.log('rreturned account ',returnedAccount);

    return newAccount.id;
      // return '';
  }

  /** Return account for params.id.
   *  Error Codes: 
   *    BAD_REQ:     id not specified.
   *    NOT_FOUND:   no account having ID id.
   */
  account(params) {
    //TODO
    if(!params.id){
      let errors = new AppErrors();
      errors.add("id not specified",{ 'code' : 'BAD_REQ'})
      return errors ;
    }

    let foundAccount = this._accounts.filter ( e => params.id === e.id)
    // new Account().info()
    // console.log('foundAccount ',foundAccount)

    if(foundAccount.length===0){
      let errors = new AppErrors();
      errors.add("no account having ID id",{ 'code' : 'NOT_FOUND'})
      return errors ;
    }
    return foundAccount[0];
  }


}

class Account {

  constructor(id,holderId,balance) {
    // TODO
    this.id = id
    this.holderId =  holderId
    this.balance = balance
    this.transactions = [];
  }

  /** Return object { id, holderId, balance } where id is account ID,
   *  holderId is ID of holder and balance is a Number giving the
   *  current account balance after the chronologically last
   *  transaction. 
   *
   *  Error Codes: None.
   */
  info(params={}) {
    //TODO

    return {id:this.id , holderId:this.holderId , balance:this.balance};
  }

  /** Return ID of a newly created transaction.  When called, params must be 
   *  an object containing at least { amount, date, memo } where:
   * 
   *    amount is a string /^[-+]?\d+\.\d\d$/ representing a number, 
   *    date is a YYYY-MM-DD string representing a valid date
   *    memo is a non-empty string.
   *
   *  representing the properties of the transaction to be created.
   *
   *  Error Codes:
   *    BAD_REQ:     params does not specifytransaction amount, 
   *                 date or memo; or amount, date do not meet 
   *                 restrictions on format.
   */
  newAct(params={}) {
    const {   amount, date, memo  } =  params  ;

    let errors = new AppErrors();
    if(!date || !amount || !memo){

      errors.add("required parameter missing",{ 'code' : 'BAD_REQ'})
      return errors ;
    }

    let fdate = getDate(date,errors)
    if(fdate.errors){
      return fdate;
    }
    let famount = getCents(amount,errors)
    if(famount.errors){
      return famount;
    }

    let act = new Transaction( genId() , params.amount , params.date  ,params.memo , Number(this.balance).toFixed(2) + Number(params.amount).toFixed(2))

    this.balance =  Number(this.balance) + Number(params.amount)
    this.balance  = Number(this.balance).toFixed(2)
    this.balance  = Number(this.balance)
    this.transactions.push(act)

    return act.id;
  }

  /** Return list of transactions satisfying params for an account.
   *  The returned list is ordered by date in non-decreasing order;
   *  transactions with the same date are ordered in the order they
   *  were added to the account.  When called, params must specify
   *
   * { actId?, fromDate?, toDate?, memoText?, count?, index?, }
   *  
   *  The optional parameters which are used to filter the
   *  returned transactions include:
   *
   *    actId:       The transaction ID (if this is specified at most
   *                 one transaction will be returned).
   *    date:        A valid YYYY-MM-DD date string.  If specified, all 
   *                 returned transactions must have date equal to this value.
   *    memoText:    A substring which must occur within the memo
   *                 field of matching transactions; the matching 
   *                 must be case-insensitive.
   *    count:       A string specifying a non-negative integer giving 
   *                 the maximum number of returned transactions 
   *                 (defaults to DEFAULT_COUNT).
   *    index:       A string specifying a non-negative integer giving the
   *                 starting index of the first returned transaction in the
   *                 ordered list of transactions satisfying the rest
   *                 of the params (defaults to 0).
   *
   *  Each transaction is returned as
   * 
   *  { id, amount, date, memo }
   *
   *    id:      The ID of the transaction.
   *    amount:  A Number giving the amount for the transaction.
   *    date:    The YYYY-MM-DD date of the transaction.
   *    memo:    The memo associated with the transaction.
   *
   *  Error Codes:  
   *    BAD_REQ:     date, count or index are specified but do
   *                 not meet their requirements.
   */
  query(params={}) {

    const { actId, date, memoText, count, index } = params

    return this.transactions
        .filter(tr => {
          if (actId)
            return tr.actId === actId;
          else return true;
        })
        .filter(tr => {
          if (memoText)
            return tr.memo.indexOf(memoText.toLowerCase()) !== -1
          else return true;
        })

  }

  /**
   *  Return list of transactions for this account ordered by date in
   *  non-decreasing order; transactions with the same date are
   *  ordered in the order they were added to the account.  The
   *  transactions can be filtered by the following optional params:
   *
   *    fromDate:    A string specifying a YYYY-MM-DD giving
   *                 the earliest date for the returned transactions.
   *    toDate:      A string specifying a YYYY-MM-DD giving
   *                 the latest date for the returned transactions.
   * 
   *  Each transaction is returned as
   * 
   *  { id, amount, date, memo, balance }
   *
   *    id:      The ID of the transaction.
   *    amount:  A Number giving the amount for the transaction.
   *    date:    The YYYY-MM-DD date of the transaction.
   *    memo:    The memo associated with the transaction.
   *    balance: A Number giving the account balance 
   *             immediately after the transaction.
   *  Error Codes:  
   *    BAD_REQ:     fromDate or toDate are not valid dates.
   */
  statement(params={}) {
    //TODO
    return this.transactions.sort( (e1,e2 )=> new Date(e2.date) - new Date(e1.date) );

  }

}

class Transaction {
  //TODO
  constructor(id,amount,date,memo,balance){
    this.id = id
    this.amount =  amount
    this.date = date
    this.memo = memo
    this.balance = balance
  }
}


