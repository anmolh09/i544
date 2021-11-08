import { makeValidator } from 'cs544-js-utils';
import { DEFAULT_LIMIT } from './consts.mjs';

export default function make(dao) { return new UserServices(dao); }

class UserServices {
  constructor(dao) {
    this._validator = makeValidator(CMDS);
    this._dao = dao;
  }


  //return created user
  async create(params) {
    return this._service(params, 'create');
  }

  //returns User
  async read(params) {
    return await this._service(params, 'read');
  }

  //returns [User]
  async search(params) {
    return await this._service(params, 'search');
  }

  //returns {}
  async clear() {
    return await this._dao.clear();
  }


  //returns replaced user
  async replace(params) {
    return await this._service(params, 'replace');
  }

  //returns updated user
  async update(params) {
    return await this._service(params, 'update');
  }

  //returns {}
  async delete(props) {
    return this._service(props, 'delete');
  }

  //given list users of user-params create all users
  //return [createdUser] or errors object
  async load(users) {
    const users1 = users.map(u => this._validator.validate('create', u));
    if (users1.find(u => u.errors)) {
      const errors =
            users1.reduce((errs, u) => errs.concat(u.errors ?? []), []);
      return { errors };
    }
    return await Promise.all(users1.map(u => this._dao.create(u)));
  }

  async _service(params, type) {
    const params1 = this._validator.validate(type, params);
    return params1.errors ? params1 : await this._dao[type](params1);
  }
  
}

const USER_FIELDS = {
  id: {
    name: 'user ID',
    required: true,
  },
  firstName: {
    name: 'first name',
    required: true,
  },
  middleInitial: {
    name: 'middle initial',
  },
  lastName: {
    name: 'last name',
    required: true,
  },
  address1: {
    name: 'street address 1',
    required: true,
  },
  address2: {
    name: 'street address 2',
  },
  city: {
    name: 'city',
    required: true,
  },
  state: {
    name: 'state',
    required: true,
  },
  zip: {
    name: 'zip',
    required: true,
    chk: /^\d{5}(-\d{4})?$/,
  },
  email: {
    name: 'email address',
    required: true,
    chk: /^[^\n\@]+\@[^\n\.]+\..+$/,
  },
};

const CREATE_FIELDS =
      { ...USER_FIELDS, ...{id: { name: 'user ID', }}};
const OPTIONAL_FIELDS =
  Object.fromEntries(Object.entries(USER_FIELDS)
		     .map(([k, v]) => [k, {...v, ...{required: false }}]));   

const CMDS = {
  create: {
    fields: CREATE_FIELDS,
    doc: 'create a new user and return user object',
  },
  read: {
    fields: OPTIONAL_FIELDS,
    doc: 'read user as per params and return list of users satisfying params',
  },
  clear: {
    fields: {},
    doc: 'clear out store',
  },
  replace: {
    fields: USER_FIELDS, 
    doc: 'replace user having id ID with user specified by params',
  },
  update: {
    fields: OPTIONAL_FIELDS,
    doc: 'update user having id ID with specified  params',
  },
  delete: {
    fields: { id: { name: 'user ID', required: true }, },
    doc: 'remove user having specified user ID',
  },
  search: {
    fields: {
      _offset: {
	name: 'results offset',
	chk: /\d+/,
	default: 0,
	valFn: str => Number(str),
      },
      _limit: {
	name: 'results limit',
	chk: /\d+/,
	default: DEFAULT_LIMIT,
	valFn: str => Number(str),
      },
      ...OPTIONAL_FIELDS,
    },
  },
};

