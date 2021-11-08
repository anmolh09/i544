import DATA from './data.mjs';
import { DEFAULT_LIMIT } from '../src/consts.mjs';

import Dao from './util/mem-user-dao.mjs'
import makeServices from '../src/user-services.mjs';
import makeWs from '../src/user-ws.mjs';
import STATUS from 'http-status';

import supertest from 'supertest';
import chai from 'chai';
const { expect } = chai;

describe('user web services', function() {
  
  const { HOMER, MARGE, BART, LISA } = DATA;

  let ws, dao;

  const BASE = '/users';
  
  beforeEach(async () => {
    dao = await Dao.setup();
    const services = makeServices(dao);
    const app = makeWs(services, BASE);
    ws = supertest(app);
  });

  afterEach(async () => {
    await Dao.tearDown(dao);
  });

  async function createUser(user) {
    return await
      ws.post(`${BASE}`)
      .set('Content-Type', 'application/json')
      .send(user);
  }


  it('must create user with location', async function() {
    const res = await createUser(HOMER);
    expect(res.status).to.equal(STATUS.CREATED);
    expect(res.headers.location).to.match(new RegExp(`${HOMER.id}$`));
  });

  it('must retrieve previously created user', async function() {
    await createUser(HOMER);
    const res = await ws.get(`${BASE}/${HOMER.id}`);
    expect(res.status).to.equal(STATUS.OK);
    expect(res.body.result).to.deep.equal(HOMER);
  });
  
  it('must delete previously created user', async function() {
    await createUser(HOMER);
    const res = await ws.delete(`${BASE}/${HOMER.id}`);
    expect(res.status).to.equal(STATUS.NO_CONTENT);
  });
  
  it('must have multiple deletes result in 404', async function() {
    await createUser(HOMER);
    const res1 = await ws.delete(`${BASE}/${HOMER.id}`);
    expect(res1.status).to.equal(STATUS.NO_CONTENT);
    const res2 = await ws.delete(`${BASE}/${HOMER.id}`);
    expect(res2.status).to.equal(STATUS.NOT_FOUND);
  });
  
  it('must replace content', async function() {
    await createUser(HOMER);
    const bartHomer = Object.assign({}, BART, { id: 'homer' });
    const res1 = await
      ws.put(`${BASE}/${HOMER.id}`)
      .set('Content-Type', 'application/json')
      .send(bartHomer);
    expect(res1.status).to.equal(STATUS.NO_CONTENT);
    const res2 = await ws.get(`${BASE}/${HOMER.id}`);
    expect(res2.status).to.equal(STATUS.OK);
    expect(res2.body.result).to.deep.equal(bartHomer);
  });
  
  it('must update content', async function() {
    await createUser(HOMER);
    const update = { fullName: 'homer simpson' }
    const updateHomer = {...HOMER, ...update };
    const res1 = await
      ws.patch(`${BASE}/${HOMER.id}`)
      .set('Content-Type', 'application/json')
      .send(update);
    expect(res1.status).to.equal(STATUS.NO_CONTENT);
    const res2 = await ws.get(`${BASE}/${HOMER.id}`);
    expect(res2.status).to.equal(STATUS.OK);
    expect(res2.body.result).to.deep.equal(updateHomer);
  });
  
  describe('search offset and limit', function() {

    beforeEach(async function() {
      for (const user of Object.values(DATA)) {
	await dao.create(user);
      }
    });

    it('must retrieve DEFAULT_LIMIT users', async function() {
      const results = await ws.get(BASE);
      expect(results.body.result).to.have.lengthOf(DEFAULT_LIMIT);
    });
    
    it('must retrieve all users when given a huge limit', async function() {
      const results = await (ws.get(BASE).query( {_limit: 9999999}));
      expect(results.body.result).to.have.lengthOf(Object.keys(DATA).length);
    });
    
    it('must retrieve all users when given a huge limit', async function() {
      const offset = 4;
      const results = await
        (ws.get(BASE).query({_limit: 9999999, _offset: offset}));
      const len = Object.keys(DATA).length - offset;
      expect(results.body.result).to.have.lengthOf(len);
    });

    it('must retrieve all Simpson users for huge limit', async function() {
      const results = await 
        (ws.get(BASE).query({_limit: 9999999, lastName: 'Simpson'}));
      const simps = Object.values(DATA).filter(u => u.lastName === 'Simpson');
      expect(results.body.result).to.have.lengthOf(simps.length);
    });
    
  });

});

