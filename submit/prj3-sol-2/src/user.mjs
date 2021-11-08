export default class User {
  constructor(props) {
    Object.assign(this, props);
    Object.freeze(this);
  }

  get emailId() {
    return this.email.replace(/@.+/, '');
  }

}

