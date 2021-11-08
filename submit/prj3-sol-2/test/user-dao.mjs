import Dao from './util/mem-user-dao.mjs'
import { DEFAULT_LIMIT } from '../src/consts.mjs';

import DATA from './data.mjs';

import chai from 'chai';
const { expect } = chai;

describe ("User DAO", function() {

  const { HOMER, MARGE, BART, LISA } = DATA;

  let dao;

  beforeEach(async () => {
    dao = await Dao.setup();
  });

  afterEach(async () => {
    await Dao.tearDown(dao);
  });

  describe ('create', function() {

    it ('must create a new user', async function () {
      const user = await dao.create(HOMER);
      expect(user?.id).equal('homer');
    });

    it ('must return EXISTS error when creating dup user', async function () {
      await dao.create(HOMER);
      const user = await dao.create({ id: 'homer' });
      expect(user?.errors?.[0]?.options?.code).to.equal('EXISTS');
    });

    it ('must return BAD_REQ when creating user sans id', async function () {
      const user = await dao.create({});
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

    it ('must return BAD_REQ when creating user with _id', async function () {
      const user = await dao.create({id: 'bart', _id: 'bart'});
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  });

  describe ('read', function() {

    it ('must retrieve a newly created user', async function () {
      await dao.create(HOMER);
      const user = await dao.read({ id: 'homer'});
      expect(user).to.deep.equal(HOMER);
    });

    it ('must return NOT_FOUND when retrieving a bad user', async function () {
      await dao.create(HOMER);
      const readUser = await dao.read({ id: 'Homer' });
      expect(readUser?.errors?.[0]?.options?.code).to.equal('NOT_FOUND');
    });

    it ('must return BAD_REQ when reading user with _id', async function () {
      await dao.create(HOMER);
      const user = await dao.read({id: 'homer', _id: 'homer'});
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

  });

  describe('search offset and limit', function() {

    beforeEach(async function() {
      for (const user of Object.values(DATA)) {
	await dao.create(user);
      }
    });

    it('must retrieve DEFAULT_LIMIT users', async function() {
      const users = await dao.search({});
      expect(users).to.have.lengthOf(DEFAULT_LIMIT);
    });
    
    it('must retrieve all users when given a huge limit', async function() {
      const users = await dao.search({_limit: 9999999});
      expect(users).to.have.lengthOf(Object.keys(DATA).length);
    });
    
    it('must retrieve all users when given a huge limit', async function() {
      const offset = 4;
      const users = await dao.search({_limit: 9999999, _offset: offset});
      expect(users).to.have.lengthOf(Object.keys(DATA).length - offset);
    });

    it('must retrieve all Simpson users for huge limit', async function() {
      const users = await dao.search({_limit: 9999999, lastName: 'Simpson'});
      const simps = Object.values(DATA).filter(u => u.lastName === 'Simpson');
      expect(users).to.have.lengthOf(simps.length);
    });
    
  });

  describe ('update', function() {

    it ('must update an existing user', async function () {
      await dao.create(LISA);
      const user1 = await dao.update({ id: 'lisa', fullName: 'Lisa Simpson' });
      expect(user1).to.deep.equal(Object.assign({}, LISA,
					    { fullName: 'Lisa Simpson' }));
    });

    it ('must return NOT_FOUND when updating a bad user', async function () {
      const updatedUser = await dao.update({ id: 'bart' });
      expect(updatedUser?.errors?.[0]?.options?.code).to.equal('NOT_FOUND');
    });

    it ('must return BAD_REQ when updating user sans id', async function () {
      await dao.create(HOMER);
      const user = await dao.update({firstName: 'Homer'});
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

    it ('must return BAD_REQ when updating user with _id', async function () {
      await dao.create(HOMER);
      const user = await dao.update({id: 'homer', _id: 'homer'});
      expect(user?.errors?.[0].options?.code).to.equal('BAD_REQ');
    });

    
  });

  describe ('delete', function() {

    it ('must delete an existing user', async function () {
      await dao.create(LISA);
      const user1 = await dao.read({ id: 'lisa' });
      expect(user1).to.not.be.undefined;
      expect(user1.errors).to.be.undefined;
      await dao.delete({ id: 'lisa' });
      const user2 = await dao.read({ id: 'lisa' });
      expect(user2?.errors?.[0]?.options?.code).to.equal('NOT_FOUND');
    });

    it ('must return NOT_FOUND when removing a bad user', async function () {
      const deletedUser = await dao.delete({ id: 'bart' });
      expect(deletedUser?.errors?.[0]?.options?.code).to.equal('NOT_FOUND');
    });

    it ('must return BAD_REQ when removing user sans id', async function () {
      await dao.create(HOMER);
      const user = await dao.delete({firstName: 'Homer'});
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });

    it ('must return BAD_REQ when removing user with _id', async function () {
      await dao.create(HOMER);
      const user = await dao.delete({id: 'homer', _id: 'homer'});
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');
    });
  });
});


