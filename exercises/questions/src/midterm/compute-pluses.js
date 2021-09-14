'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 13:22:16 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class ComputePluses extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = ComputePluses;
Object.assign(ComputePluses, {
  id: 'computePluses',
  title: 'Compute Pluses Function',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;

function question() {
  let text = '';
  text += `
    Write a function .~computePluses(text)~ which returns .~text~
    with all occurrences of two integers separated by the whitespace
    surrounded word \`plus\` replaced by their sum.  Each integer may
    be preceeded by an optional \`+\` or \`-\` sign; the characters in
    the word \`plus\` may be any combination of upper or lower case.

    *Examples*:

    ~~~
    > computePluses('the sum is 2 plus    +7 plus -3')
    'the sum is 6'
    > computePluses('the sum is2 pLus    +7 PLUS -3')
    'the sum is6'
    > computePluses('the sum is 2plus    +7 plus -3')
    'the sum is 2plus    4'
    ~~~

    *Restriction*: Your code may not use any destructive operations.
    "${POINTS}-points".
  `;
  return text;
}

function answer() {
  let text = `
~~~
${computePluses}
~~~

*Grading Rubrics*:

  + Repeated use of destructive operations: -6.

  + Missing whitespace around \`plus\`: -1.

  + Missing case-insensitive: -1.
  `;
  return text;
}

function computePluses(text) {
  const regex = /([-+]?\d+)\s+plus\s+([-+]?\d+)/ig;
  if (regex.test(text)) {
    const text1 = text.replace(regex, (_, n1, n2) => Number(n1) + Number(n2));
    return computePluses(text1);
  }
  else {
    return text;
  }
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new ComputePluses().qaText());
}
