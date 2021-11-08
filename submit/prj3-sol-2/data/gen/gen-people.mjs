#!/usr/bin/env node

const Path = require('path');
const oneCli = require('1cli');

const DOMAIN = 'binghamton.edu';
const MAX_TRIES = 3;

function genEmail(person, emails) {
  const base =
    ((person.firstName[0] ?? '') + person.lastName.slice(0, 5)).toLowerCase();
  for (let i = 0; i < MAX_TRIES; i++) {
    const email = base + ((i === 0) ? '' : i.toString());
    if (!emails.has(email)) return `${base}@${DOMAIN}`;
  }
  console.error(`cannot generate email for ${base} ${person}`);
}

function go(peopleCsv, nPeople) {
  const people = oneCli.File.read(peopleCsv).slice(0, nPeople);
  people.forEach(p => delete p.fortune);
  const emails = new Set();
  people.forEach(p => p.email = genEmail(p, emails));
  return people;
}


function usage() {
  console.error(`${Path.basename(process.argv[1])} PEOPLE_CSV N_PEOPLE`);
  process.exit(1);
}

function main() {
  if (process.argv.length !== 4) usage();
  const [ peopleCsv, nPeople ] = process.argv.slice(2);
  const people = go(peopleCsv, nPeople);
  console.log(JSON.stringify(people));
}

main();


