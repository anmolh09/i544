'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 13:24:51 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class ComputeTimes extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = ComputeTimes;
Object.assign(ComputeTimes, {
  id: 'computeTimes',
  title: 'Compute Times Function',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;

function question() {
  let text = '';
  text += `
    Write a function .~computeTimes(text)~ which returns .~text~
    with all occurrences of two integers separated by the whitespace
    surrounded word \`times\` replaced by their product.  Each integer may
    be preceeded by an optional \`+\` or \`-\` sign; the characters in
    the word \`times\` may be any combination of upper or lower case.

    *Examples*:

    ~~~
    > computeTimes('the product is 2 times    +7 times -3')
    'the sum is -42'
    > computeTimes('the product is2 times    +7 TIMES -3')
    'the sum is-42'
    > computeTimes('the product is 2times    +7 times -3')
    'the product is 2times    -21'
    ~~~

    *Restriction*: Your code may not use any destructive operations.
    "${POINTS}-points".
  `;
  return text;
}

function answer() {
  let text = `

During the exam it was announced that "the sum is" in the examples
should have been "the product is".

~~~
${computeTimes}
~~~

*Grading Rubrics*:

  + Repeated use of destructive operations: -6.

  + Missing whitespace around \`times\`: -1.

  + Missing case-insensitive: -1.
  `;
  return text;
}

function computeTimes(text) {
  const regex = /([-+]?\d+)\s+times\s+([-+]?\d+)/ig;
  if (regex.test(text)) {
    const text1 = text.replace(regex, (_, n1, n2) => Number(n1) * Number(n2));
    return computeTimes(text1);
  }
  else {
    return text;
  }
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new ComputeTimes().qaText());
}
