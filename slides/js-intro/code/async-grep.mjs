#!/usr/bin/env node

import fs from 'fs'; //@modules
import Path from 'path';
import process from 'process';
import readline from 'readline';

//.abort0.
function abort(...args) { //@rest-args
  console.error(...args); //@spread-args
  process.exit(1);
}
//.abort1.

function main() {
  if (process.argv.length < 4) {
    abort('usage: %s REGEX FILE...',
          Path.basename(process.argv[1]));
  }
  let regex;
  try {
    regex = new RegExp(process.argv[2]);
  }
  catch(err) {
    abort("bad regex %s: %s", process.argv[2],
          err.message);
  }
  grep(regex, process.argv.slice(3));
}

//.1.
function grep(regex, files) {
  for (const file of files) {
    fs.open(file, 'r', function(err, fd) { //@open
      if (err) {
        console.error("cannot read file %s: %s",
                      file, err.message);
      }
      else {
        const rl = readline.createInterface({
          input: fs.createReadStream(file, {fd: fd}),
          crlfDelay: Infinity //@crlfDelay
        });
//.2.
        let lineN = 1;
        rl.on('line', (line) => { //@line
          if (line.match(regex)) {
            console.log("%s:%i: %s",
                        file, lineN, line);
          }
          lineN++; //@closure
        });
        rl.on('error', function() { //@error
          console.error("cannot read %s: %s",
                        file, err.message);
        });
      }
    }); //fs.open()
  } //for          
} //grep()
//.3.

main();
