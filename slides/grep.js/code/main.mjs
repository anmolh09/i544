#!/usr/bin/env node

//system imports do not specify any / in module path or extension.
//importing module can assign any name to imported entity.
import fs from 'fs';     //nodejs filesystem routines
import Path from 'path'; //path utils

//project imports must specify / in module path and extension
import jgrep from './jgrep.mjs';

//every module can have a default export; all previous imports were
//of default exports.
//Following is import of non-default export. We are importing using
//same name as exporting module, possible to use a different name
//using an extended syntax.
import { makeRegex } from './common.mjs';

//when a nodejs program starts up process.argv[] contains cli args:
// [0]: path to nodejs
// [1]: path to this program
// [2]: regex
// [3]: path to file to be grep'd
function main() {
  if (process.argv.length !== 4) usage();
  const [ regexStr, path ] = process.argv.slice(2); //destructuring
  const regex = makeRegex(regexStr);
  if (!regex) error(`bad regex "${regexStr}"`);
  const content = readFile(path);
  const results = jgrep(regex, content);
  report(path, content, results);
}

const CHAR_SET = 'utf8';
function readFile(path) {
  try {
    //using readFileSync() is unusual in real programs
    //normally files are read asynchronously
    return fs.readFileSync(path, CHAR_SET);
  }
  catch (err) {
    error(`cannot read ${path}: ${err.message}`);
  }
}

function report(path, content, results) {
  const lines = content.split('\n');
  for (const result of results) {
    const { lineIndex } = result;  //destructuring
    console.log(`${path}:${lineIndex + 1}: ${lines[lineIndex]}`);
  }
}

function error(msg) {
  console.error(msg);
  process.exit(1);
}


function usage() {
  error(`${Path.basename(process.argv[1])} REGEX PATH`);
}

    

//get things started
main();
