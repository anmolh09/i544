import makeDao from '../../src/user-dao.mjs';

import { MongoMemoryServer } from 'mongodb-memory-server';

import { assert } from 'chai';

export default class {

  static async setup() {
    const mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    assert(mongod.getInstanceInfo(), `mongo memory server startup failed`);
    const dao = await makeDao(uri);
    dao._mongod = mongod;
    return dao;
  }

  static async tearDown(dao) {
    await dao.close();
    await dao._mongod.stop();
    assert.equal(dao._mongod.getInstanceInfo(), false,
		 `mongo memory server stop failed`);
  }

  static get NAME() { return 'Real DAO using in-memory mongo'; }

}
