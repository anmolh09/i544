import assert from 'assert';
import mongo from 'mongodb';
import { DEFAULT_LIMIT } from './consts.mjs';

export default function make(mongoUrl) {  return UserDao.make(mongoUrl); }

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };

/** This module provides CRUD for user-info.  A user-info
 *  object must have an id property.
 * 
 *  Error Handling: If a function detects an error, then it returns
 *  an object with an errors property.
 */

class UserDao {
  constructor(props) {
    Object.assign(this, props);
  }


  //factory since async constructor cannot work
  static async make(mongoUrl) {
    try {
      const client = await mongo.connect(mongoUrl, MONGO_CONNECT_OPTIONS);
      const db = client.db();
      const users = db.collection(USERS_TABLE);
      return new UserDao({client, users});
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }

  /** Release all resources held by this image store.  Specifically,
   *  close any database connections.
   */
  async close() {
    try {
      await this.client.close();
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }

  /** Clear out all users 
   *
   *  Defined Error Codes:
   *
   *    DB:          a database error occurred.
   */
  async clear(user) {
    try {
      const ret = await this.users.deleteAll({});
    }
    catch (err) {
      return errors('DB', err.toString());
    }
    return { };
  }
  
  /** Create the user specified by argument user. Return user.
   *
   *  Defined Error Codes:
   *
   *    BAD_REQ:     a user in users has an invalid property name.
   *    EXISTS:      the database already contains a user for ID.
   *    DB:          a database error occurred.
   */
  async create(user) {
    try {
      const dbUser = toDbUser(user);
      if (dbUser.errors) return dbUser;
      const ret = await this.users.insertOne(dbUser);
      assert(ret.insertedId === dbUser.id);
      return user;
    }
    catch (err) {
      if (isDuplicateError(err)) {
	return errors('EXISTS', `user ${user.id} already exists`);
      }
      else {
	return errors('DB', err.toString());
      }
    }
  }

  /** Delete complete user-info for the user specified by argument
   *  user.  Return {} if ok, else errors.
   *
   *  Defined Error Codes:
   *
   *    BAD_REQ:     a user in users has an invalid property name.
   *    NOT_FOUND:   cannot find one-or-more user in users in db.
   *    DB:          a database error occurred.
   */
  async delete(user) {
    try {
      const dbUser = toDbUser(user);
      if (dbUser.errors) return dbUser;
      const ret = await this.users.deleteOne(dbUser);
      if (ret.deletedCount === 0) {
	return errors('NOT_FOUND', `user ${user.id} not found`);
      }
      else if (ret.deletedCount !== 1) {
	return errors('DB', `multiple deletions ${delectedCount} for ` +
			    `user ${user.id}`);
      }
      return {};
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }

  /** Read complete user-info for the user specified by argument
   *  params.id.  The return'd promise resolves to a single user.
   *
   *  Defined Error Codes:
   *
   *    BAD_REQ:     a user in users has an invalid property name.
   *    NOT_FOUND:   cannot find user with specified id in db.
   *    DB:          a database error occurred.
   */
  async read(params) {
    try {
      const dbUser = toDbUser(params, true);
      if (dbUser.errors) return dbUser;
      const ret = await this.users.find(dbUser);
      const retUsers = await ret.toArray();
      if (retUsers.length === 0) {
	return errors( 'NOT_FOUND', `user ${params.id} not found`)
      }
      else if (retUsers.length !== 1) {
	return errors('DB', `multiple users ${retUsers.length} for ` +
		      `user ${params.id}`);
      }
      return fromDbUser(retUsers[0]);
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }

  /** Read complete user-info for all the users specified by argument
   *  params.  The return'd promise resolves to a list of all the
   *  user-info's.
   *
   *  Defined Error Codes:
   *
   *    BAD_REQ:     a user in users has an invalid property name.
   *    NOT_FOUND:   cannot find user with specified id in db.
   *    DB:          a database error occurred.
   */
  async search(params) {
    try {
      const dbUser = toDbUser(params, false);
      if (dbUser.errors) return dbUser;
      const cursor = await this.users.find(dbUser);
      const dbUsers =  await cursor
	    .skip(params._offset ?? 0)
            .limit(params._limit ?? DEFAULT_LIMIT)
            .toArray();
      return dbUsers.map(u => fromDbUser(u));
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }

  /** Update the user specified by argument user.  Return 
   *  updated user.
   *
   *  Defined Error Codes:
   *
   *    BAD_REQ:     a user in users has an invalid property name.
   *    NOT_FOUND:   cannot find user specified by id in db.
   * 
   */
  async update(user) {
    try {
      const dbUser = toDbUser(user);
      if (dbUser.errors) return dbUser;
      const set = Object.assign({}, dbUser);
      delete set._id;
      const ret =
	await this.users.updateOne({ _id: dbUser._id }, { $set: set });
      if (ret.matchedCount === 0) {
	return errors( 'NOT_FOUND', `user ${user.id} not found`)
      }
      else if (ret.matchedCount !== 1) {
	return errors('DB', `multiple deletions ${retUsers.length} for ` +
			    `user ${user.id}`);
      }
      else {
	return await this.read(user);
      }
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }

  /** Replace the user specified by argument user.  Return 
   *  replaced user.
   *
   *  Defined Error Codes:
   *
   *    BAD_REQ:     a user in users has an invalid property name.
   *    NOT_FOUND:   cannot find user specified by id in db.
   * 
   */
  async replace(user) {
    try {
      const dbUser = toDbUser(user);
      if (dbUser.errors) return dbUser;
      const ret =
	await this.users.replaceOne({ _id: dbUser._id }, dbUser);
      if (ret.modifiedCount === 0) {
	return errors( 'NOT_FOUND', `user ${user.id} not found`)
      }
      else if (ret.modifiedCount !== 1) {
	return errors('DB', `multiple replacements ${retUsers.length} for ` +
			    `user ${user.id}`);
      }
      else {
	return await this.read(user);
      }
    }
    catch (err) {
      return errors('DB', err.toString());
    }
  }
  
} //class UsersStore


const USERS_TABLE = 'userInfos';


//DbUser objects are populated from user-info objects.  A DbUser
//always has an id property and a mongo _id field set to the id
//property.


function fromDbUser(dbUser) {
  const user = { ...dbUser };
  delete user._id;
  return user;
}

/** Return a dbUser which is just like user except that if mustHaveId
 *  is true, then it ensures that it has an id (which defaults to the
 *  configured git email address of the user running this code) and a
 *  _id property.
 *
 *  Defined Error Codes:
 *
 *    BAD_REQ:     user already contains a _id property or is missing
 *                 a required id property.
 * 
 */ 
function toDbUser(user, idIsRequired=true) {
  if (user._id) {
    const msg = `invalid property name _id for user ${JSON.stringify(user)}`;
    return errors('BAD_REQ', msg);
  }
  const isNoId = (user.id === null || user.id === undefined);
  if (idIsRequired && isNoId) {
    const msg = `no id for user in ${JSON.stringify(user)}`;
    return errors('BAD_REQ', msg);
  }
  const dbUser = { ...user };
  for (const k of Object.keys(dbUser)) {
    if (k.startsWith('_')) delete dbUser[k];
  }
  const idUser = isNoId ? {} : { _id: user.id };
  return { ...dbUser, ...idUser };
}

function errors(code, msg) {
  return { errors: [ { message: msg, options: {code} }, ] };
}

function isDuplicateError(err) {
  return (err.code === 11000);
}




  
