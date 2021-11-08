#!/usr/bin/env node

import makeDao from './user-dao.mjs';
import makeServices from './user-services.mjs';
import makeWs from './user-ws.mjs';


import { cwdPath, readJson } from 'cs544-node-utils';

import fs from 'fs';
import https from 'https';
import Path from 'path';


function usage() {
  const prog = Path.basename(process.argv[1]);
  console.error(`usage: ${prog} CONFIG.mjs [USERS_JSON|USERS_JSONL]`);
  process.exit(1);
}

export default async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 && args.length !== 2) usage();
  try {
    const configPath = cwdPath(args[0]);
    const config = (await import(configPath)).default;
    const { port = 1234, base } = config.ws;
    const dao = await makeDao(config.db.url);
    const services = makeServices(dao);
    if (args.length == 2) {
      const data = await readJson(args[1]);
      if (data.errors) exitErrors(data.errors);
      const loadResult = await services.load(data);
      if (loadResult.errors) exitErrors(loadResult.errors);
    }
    const app = makeWs(services, base);
    https.createServer({
      key: fs.readFileSync(config.https.keyPath),
      cert: fs.readFileSync(config.https.certPath),
    }, app)
      .listen(config.ws.port, function() {
	console.log(`listening on port ${config.ws.port}`);
      });
  }
  catch (err) {
    console.error(`cannot create server: ${err}`);
    process.exit(1);
  }
}

function exitErrors(errors) {
  for (const err of errors) {
    console.error(err.message ?? err.toString());
  }
  process.exit(1);
}
