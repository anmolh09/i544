import Dao from './util/mem-user-dao.mjs'

import DATA from './data.mjs';

import makeServices from '../src/user-services.mjs';

import chai from 'chai';
const { expect } = chai;

describe ('User Services', function() {

  const { HOMER, MARGE, BART, LISA } = DATA;

  let service;
  let dao;

  beforeEach(async () => {
    dao = await Dao.setup();
    service = makeServices(dao);
  });

  afterEach(async () => {
    await Dao.tearDown(dao);
  });

  describe ('create', function() {

    it ('must create a new user', async function () {
      const user = await service.create(HOMER);
      expect(user.id).to.equal('homer');
    });

    it ('must return EXISTS error when creating dup user', async function () {
      await service.create(HOMER);
      const user = await service.create(HOMER);
      expect(user.errors[0].options.code).to.equal('EXISTS');
    });

    it('must return BAD_REQ where required missing', async function () {
      const homer = { ...HOMER };
      delete homer.firstName;
      const user = await service.create(homer);
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_REQ');      
    });

    it('must return BAD_VAL where for bad zip', async function () {
      const homer = { ...HOMER, zip: 'x1234' };
      const user = await service.create(homer);
      expect(user?.errors?.[0]?.options?.code).to.equal('BAD_VAL');      
    });

  });

  describe ('read', function() {

    it ('must retrieve a newly created user', async function () {
      await service.create(HOMER);
      const user = await service.read({ id: 'homer'});
      expect(user).to.deep.equal(HOMER);
    });

    it ('must return NOT_FOUND when retrieving a bad user', async function () {
      await service.create(HOMER);
      const readUser = await service.read({ id: 'Homer' });
      expect(readUser.errors[0].options.code).to.equal('NOT_FOUND');
    });

    
    // it ('must return filtered users', async function () {
    //   await service.create(HOMER);
    //   const user = await service.read({firstName: 'Homer'});
    //   expect(user).to.deep.equal(HOMER);
    // });
  });

  describe ('update', function() {

    it ('must update an existing user', async function () {
      await service.create(LISA);
      await service.update({ id: 'lisa', fullName: 'Lisa Simpson' });
      const user1 = await service.read({ id: 'lisa' });
      expect(user1).to.deep.equal(Object.assign({}, LISA,
					   { fullName: 'Lisa Simpson' }));
    });

    it ('must return NOT_FOUND when updating a bad user', async function () {
      const updatedUser = await service.update({ id: 'bart' });
      expect(updatedUser.errors[0].options.code).to.equal('NOT_FOUND');
    });

    it ('must return BAD_REQ when updating user sans id', async function () {
      await service.create(HOMER);
      const user = await service.update({firstName: 'Homer'});
      expect(user.errors[0].options.code).to.equal('BAD_REQ');
    });
    
    it('must return BAD_VAL for updating bad zip', async function () {
      await service.create(HOMER);
      const update = await service.update({ id: 'homer', zip: 'x1234' });
      expect(update?.errors?.[0]?.options?.code).to.equal('BAD_VAL');      
    });

  });

  describe ('delete', function() {

    it ('must delete an existing user', async function () {
      await service.create(LISA);
      const user1 = await service.read({ id: 'lisa' });
      expect(user1).to.not.be.undefined;
      expect(user1.errors).to.be.undefined;
      await service.delete({ id: 'lisa' });
      const user2 = await service.read({ id: 'lisa' });
      expect(user2.errors[0].options.code).to.equal('NOT_FOUND');
    });

    it ('must return NOT_FOUND when removing a bad user', async function () {
      const deletedUser = await service.delete({ id: 'bart' });
      expect(deletedUser.errors[0].options.code).to.equal('NOT_FOUND');
    });

    it ('must return BAD_REQ when removing user sans id', async function () {
      await service.create(HOMER);
      const user = await service.delete({firstName: 'Homer'});
      expect(user.errors[0].options.code).to.equal('BAD_REQ');
    });

  });

  describe ('load', function() {

    const USERS = [LISA, BART, MARGE, HOMER];
    
    it ('must load multiple users', async function () {
      await service.load(USERS);
      for (const user of USERS) {
	const user1 = await service.read({ id: user.id });
	expect(user1).to.deep.equal(user);
      }
    });
    
  });
});


