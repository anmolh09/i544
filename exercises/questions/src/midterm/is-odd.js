'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-07 16:22:09 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class IsOdd extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = IsOdd;
Object.assign(IsOdd, {
  id: 'isOdd',
  title: 'Check Is Odd',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 5;

function question() {
  let text = '';
  text += `
    Explain why the following code does not work:

    ~~~
    /** Assuming that n is an integer, return true iff it is odd. */
    function isOdd(n) { return n % 2 === 1; }
    ~~~

    Describe how you would fix it. "${POINTS}-points"
  `;
  return text;
}

function answer() {
  let text = `
    The problem is that if \`n\` is a negative odd integer, then \`n % 2\`
    will return \`-1\` which will compare false with \`1\`.  A correct
    expression would be \`n % 2 !== 0\`.
  `;
  return text;
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new IsOdd().qaText());
}







