import mongo,{MongoClient} from 'mongodb';
import {genId} from './util.mjs';
import { AppError } from './util.mjs';


/** Return DAO for DB URL url and options. Only option is
 *  options.doClear; if specified, then all data should be cleared.
 * 
 *  Returned DAO should support a close() method.  
 *
 *  Returned DAO should also support a newAccount(), info(), newAct(),
 *  query() and statement() methods with each method taking a single
 *  params object as argument.  The params argument and return values
 *  for these methods are as documented for project 1.
 *
 *  It is assumed that params is fully validated except that id may
 *  not refer to an existing account.  Can also assume that values
 *  in params have been converted as necessary:
 * 
 *    params.amount:  Number in cents.
 *    params.index:   Number with default filled in.
 *    params.count:   Number with default filled in.
 *
 *  (see table in accounts-services.mjs for validations and conversions).
 *
 *  [Note that unlike project 1, there is no intermediate account()
 *  method or corresponding object, all methods operate directly on
 *  the returned DAO.]
 *
 */
export default function makeAccountsDao(url, options) {

  return AccountDao.make(url)

}

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };
const ACCOUNTS_COLLECTION = 'accounts';
const DB_NAME = 'web';
const RAND_LEN = 2;
const NEXT_ID_KEY = 'next_id';


class AccountDao {

  constructor(props) {
    Object.assign(this, props);
  }

  //factory since async constructor cannot work
  static async make(mongoUrl='mongodb+srv://admin:admin@bing.i75uq.mongodb.net') {
    try {
      const client = new MongoClient(mongoUrl);
      // const client = await mongo.connect(mongoUrl, MONGO_CONNECT_OPTIONS);
      await client.connect();

      const db = client.db(DB_NAME);
      return new AccountDao({client,db});
    } catch (err) {
      return errors('DB', err.toString());
    }
  }


  /** Release all resources held by this image store.  Specifically,
   *  close any database connections.
   */
  async close() {
    try {
      await this.client.close();
    } catch (err) {
      // return errors('DB', err.toString());
    }
  }



  async newAccount(acc) {
    try {
      // const dbUser = toDbUser(user);
      // if (dbUser.errors) return dbUser;
      const nextId = await this.getNextId()
      // console.log('nextid ',nextId)

      const ret = await this.db.collection(ACCOUNTS_COLLECTION)
          .insertOne({'id': nextId , ...acc , balance:0});
      // assert(ret.insertedId === dbUser.id);
      return nextId;
    }
    catch (err) {
      // if (isDuplicateError(err)) {
      //   return errors('EXISTS', `user ${user.id} already exists`);
      // }
      // else {
      //   return errors('DB', err.toString());
      // }
    }
  }

  async newAct(params={}){
    // console.log('in newact',params.amount)
    const { amount, date, memo , id } =  params  ;
    const nextId = await this.getNextId('next_act_id')
    let decimal = mongo.Decimal128;

    const account = await this.db.collection(ACCOUNTS_COLLECTION).findOne({id:id})
    // console.log('newact account ',account);
    let decimalAmt =  Number(amount)/100
    decimalAmt = Number(decimalAmt.toFixed(2))
    let newBalance = account.balance + decimalAmt
    newBalance = Number(newBalance.toFixed(2))
    const dateObj = new Date(date)

    await this.db.collection(ACCOUNTS_COLLECTION).updateOne({id:id},
        { $set: {balance : newBalance},
          $push:{ 'transactions':{ actId:nextId, amount : decimalAmt,date:dateObj, memo, balance: account.balance }}});

    return nextId;
  }

  async query(params = {}){
    // console.log('in query',params)
    const { actId, date, memoText, count, index } = params
    // console.log(actId.length);
    // console.log(memoText.length);
    let filter = {};
        // {"id" : params.id};
    if (actId && actId.length>0) {
      filter['transactions.actId'] =  actId
    }
    if (memoText && memoText.length>0){
      filter['transactions.memo'] = { '$regex' : memoText, '$options' : 'i'}
    }
    if (date && date.length>0) {
      filter['transactions.date'] = new Date(date)
    }
    // console.log('filter object ',filter)
    const account = await this.db.collection(ACCOUNTS_COLLECTION)
        // .find({"id" : {$eq : params.id}})
        .find(filter)
        // ,{"projection" : {"transactions":1,"id":1} })
        // .project({"transactions.actId":1,"id":1})
        .limit(count)
        .toArray()

    const rettr = account[0].transactions || [];

    // console.log('returned from filter query? ',rettr)
    // console.log('account::: ',account);
    return rettr
        .filter(tr => {
          if (actId && actId.length>0) {
            return tr.actId === actId;
          } else return true;
        })
        .filter(tr => {
          if (memoText && memoText.length>0)
            return tr.memo.toLowerCase().indexOf(memoText.toLowerCase()) !== -1
          else return true;
        })
        .filter(tr => {
          if (date && date.length>0) {
            if (tr.date === date) {
              return tr.date === date
            }
          } else return true;
        })
        .sort( (e1,e2 ) => new Date(e1.date) - new Date(e2.date) )
        .slice(index,index + count);
  }

  async statement(params={}) {
    // console.log('in statement params',params)
    const { fromDate, toDate, id } = params
    let filter = {"id" : params.id};
    if(fromDate && toDate){
      filter['transactions.date'] =  { '$lte' : new Date(toDate)  , '$gte': new Date(fromDate)}
    }


    const account = await this.db.collection(ACCOUNTS_COLLECTION)
        .findOne(filter)

    // console.log('statement return object',account)



    return account.transactions
        .filter( tr => {
          if(fromDate && toDate){
            let trDate = new Date(tr.date);
            if( trDate >= new Date(fromDate) && trDate <= new Date(toDate))
              return true;
            else
              return false;
          }
          else
            return true;
        })
        .sort( (e1,e2 ) => new Date(e1.date) - new Date(e2.date) );



  }


async info(params = {}){
    // console.log('in info',params)
    const account = await this.db.collection(ACCOUNTS_COLLECTION).findOne(params)

  // console.log('info fn:: ',account)

    return account;
  }

  async getNextId( id_type ) {

    const type = id_type || NEXT_ID_KEY;
    const db = this.client.db(DB_NAME);
    const meta = db.collection('meta');

    const query = {_id: type};
    const update = {$inc: {[type]: 1}};
    const options = {upsert: true, returnDocument: 'after'};
    const ret =
        await meta.findOneAndUpdate(query, update, options);
    const seq = ret.value[type];
    const id =
        String(seq) + Math.random().toFixed(RAND_LEN)
            .replace(/^0\./, '_');
    // console.log('id:::',Object.getPrototypeOf( id))
    // console.log('id type:::',id instanceof String)
    // console.log('String(id):::',String(id))


    return id;
  }

}
function errors(code, msg) {
  return { errors: [ new AppError(msg, {code}) ] };
}

function isDuplicateError(err) {
  return (err.code === 11000);
}
