import UserStore from './user-store.mjs';
import UserServices from './user-services.mjs';

import fs from 'fs';
import Path from 'path';
import util from 'util';

const {promisify} = util;


async function main(args) {
  if (args.length < 2) usage();
  const [mongoUrl, ...rest] = args;
  const cmd = await Command.makeCommand(rest);
  let userStore;
  try {
    userStore = await UserStore.make(mongoUrl);
    if (!userStore.isOk) { errors(userStore); process.exit(1); }
    const userServices = UserServices(userStore.val);
    //dispatch cmd to user store.
    const ret = await userServices[cmd.cmd].call(userServices, cmd.arg);
    if (ret.isOk) {
      if (ret.val) console.log(JSON.stringify(ret.val, null, 2));
    }
    else {
      errors(ret.val);
    }
  }
  finally {
    if (userStore && userStore.isOk) await userStore.val.close();
  }
}

export default function () { return main(process.argv.slice(2)); }

const CMDS = [ 'load', 'create', 'read', 'update', 'delete', ];
class Command {
  constructor(cmd, arg) {
    this.cmd = cmd;
    this.arg = arg;
    Object.freeze(this);
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }

  //factory since async constructor will not work
  static async makeCommand(args) {
    const cmd = args.shift();
    if (cmd === undefined) usageError('missing command');
    if (CMDS.indexOf(cmd) < 0) usageError(`bad command "${cmd}"`);
    let cmdArg;
    if (cmd === 'load') {
      if (args.length !== 1) {
	usageError('missing path to JSON file');
      }
      else {
	cmdArg = await readJson(args[0]);
	if (!(cmdArg instanceof Array)) {
	  usageError('expect JSON array of users');
	}
      }
    }
    else {
      const argPairs = args.map(a => a.split('=', 2));
      if (argPairs.find(p => p.length !== 2)) {
	usageError('expect name=value pairs');
      }
      cmdArg = Object.fromEntries(argPairs);
    }
    return new Command(cmd, cmdArg);
  }
} //class Command

async function readJson(path) {
  let contents;
  try {
    contents = await promisify(fs.readFile)(path, 'utf8');
  }
  catch (err) {
    usageError(`unable to read ${path}: ${err}`);
  }
  try {
    return JSON.parse(contents);
  }
  catch (err) {
    usageError(`unable to parse JSON from ${path}: ${err}`);
  }
}

/** Output usage message to stderr and exit */
function usage() {
  const argv = process.argv;
  const msg = `
    usage: ${Path.basename(argv[1])} DB_URL CMD [ARGS]
where CMD [ARGS] is
    load JSON_FILE
    create|read|update|delete [NAME=VALUE...]
  `;
  console.error(msg.trim());
  process.exit(1);
}

function usageError(err) {
  if (err) console.error(err);
  usage();
}

function errors(appErrors) {
  appErrors.errors.forEach(e => console.error(e.toString()));
}

