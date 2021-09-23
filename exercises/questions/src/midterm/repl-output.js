'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-07 16:22:29 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class ReplOutput extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = ReplOutput;
Object.assign(ReplOutput, {
  id: 'replOutput',
  title: 'REPL Output',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 5;

function question() {
  let text = '';
  text += `
    Consider the following log of nodejs's REPL:

    ~~~
    > let x = 42
    undefined
    > x = 42
    42
    >
    ~~~

    Explain why the two inputs result in the REPL printing two different
    values. "${POINTS}-points"
  `;
  return text;
}

function answer() {
  let text = `
    The first input is a declaration which is syntactically a
    statement.  Statements do not have values; hence there is no value
    to print and nodejs prints .~undefined~.

    The second input is an assignment which in JavaScript (and many
    other C-derived languages) is syntactically an expression.
    Expressions always have a value; for an assignment statement its
    value is the value being assigned which in this case is \`42\`.
    Hence the value of the second input is \`42\` which is what is
    printed by the REPL.
  `;
  return text;
}

function replOutput(text) {
  const regex = /([-+]?\d+)\s+times\s+([-+]?\d+)/ig;
  if (regex.test(text)) {
    const text1 = text.replace(regex, (_, n1, n2) => Number(n1) * Number(n2));
    return replOutput(text1);
  }
  else {
    return text;
  }
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new ReplOutput().qaText());
}



