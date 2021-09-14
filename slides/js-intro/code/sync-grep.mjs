#!/usr/bin/env node

import fs from 'fs'; //@modules
import Path from 'path';
import process from 'process';

function abort(...args) { //@rest-args
  console.error(...args); //@spread-args
  process.exit(1);
}

//.1.
function main() {
  if (process.argv.length < 4) { //@argv
    abort('usage: %s REGEX FILE...', 
          Path.basename(process.argv[1])); //@basename
  }
  let regex; //@let
  try {
    regex = new RegExp(process.argv[2]);
  }
  catch(err) {
    abort("bad regex %s: %s", process.argv[2],
          err.message);
  }
  grep(regex, process.argv.slice(3));
}

//.2.
function grep(regex, files) { 
  for (const file of files) { //@for-of
    try {
      const contents = fs.readFileSync(file).toString();
      let lineN = 1;
      for (const line of contents.split('\n')) {
        if (line.match(regex)) { //@regex
          console.log("%s:%i: %s", file, lineN, line);
        }
        lineN++;
      }
    }
    //.3.
    catch (err) { //@exception
      console.error("cannot read %s: %s", file,
                    err.message);
    }
  } //for
} //grep()

main();
