import mongo from 'mongodb';
import {genId} from './util.mjs';


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
export default  function makeAccountsDao(url, options) {
  //TODO
  return AccountDao.make(url)

}

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };
const ACCOUNTS = 'accounts';
const DB_NAME = 'web';
const RAND_LEN = 2;
const NEXT_ID_KEY = 'next_id';


class AccountDao {

  constructor(props) {
    Object.assign(this, props);

    console.log('accountdao this ',this)
  }

  //factory since async constructor cannot work
  static async make(mongoUrl='mongodb+srv://admin:admin@bing.i75uq.mongodb.net') {
    try {
      const client = await mongo.connect(mongoUrl, MONGO_CONNECT_OPTIONS);
      const db = client.db(DB_NAME);
      const accounts = db.collection(ACCOUNTS);
      return new AccountDao({client, accounts,db});
    } catch (err) {
      // return errors('DB', err.toString());
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
      console.log('nextid ',nextId)

      const ret = await this.db.collection('accounts').insertOne({'id': nextId , ...acc});
      // assert(ret.insertedId === dbUser.id);
      return ret;
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

  async query(params = {}){

  }

  async newAct(params={}){
    console.log('in newact',params)
    const { amount, date, memo , id } =  params  ;
    const nextId = await this.getNextId('next_act_id')
    await this.db.collection('accounts').updateOne({id:id},
        {$push:{ 'transactions':{ actId:nextId, amount, date, memo }}});

  }

  async info(params = {}){
    console.log('in info',params)
    const account = await this.db.collection('accounts').findOne(params)

    const balance = account.transactions.reduce( (acc,e) =>  acc + e.amount , 0)
    console.log('amt :: ',balance)
    const {holderId,id} = account

    return {holderId, id, balance};
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
    console.log('id:::',Object.getPrototypeOf( id))
    console.log('id type:::',id instanceof String)
    console.log('String(id):::',String(id))


    return id;
  }

}


//TODO
