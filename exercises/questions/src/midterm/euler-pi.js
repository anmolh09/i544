'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 13:29:55 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class EulerPi extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = EulerPi;
Object.assign(EulerPi, {
  id: 'eulerPi',
  title: 'Compute Pi using Euler Series',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;

function question() {
  let text = '';
  text += `
    Euler showed that .$\\frac{\\pi^2}{6} = \\sum_{i=1}^\\infty i^{-2}
    = \\frac{1}{1^2} + \\frac{1}{2^2} + \\frac{1}{3^2} +
    \\frac{1}{4^2} + \\ldots$

    *Subject to the same restrictions as in Homework 1*, write a
    function .~eulerPi(n)~ which computes an approximation to .$\\pi$
    using the first .~n~ terms of the above series for .~n >= 0~.

    *Examples*:

    ~~~
    > eulerPi(0)
    0
    > eulerPi(1)
    2.449489742783178
    > eulerPi(10)
    3.04936163598207
    > eulerPi(100000)
    3.141583104326456
    ~~~

    Show the result of using your function to compute
    \`eulerPi(1000)\`. "${POINTS}-points".
  `;
  return text;
}

function answer() {
  let text = `
~~~
${eulerPi}
~~~

with the following log:

~~~
> eulerPi(1000)
3.1406380562059946
~~~

*Grading Rubrics*

  + Gross violation of homework 1 restrictions: -6; proportionate if
    less gross.

  + Missing \`eulerPi(1000)\` value: -3

  + Incorrect \`eulerPi(1000)\` value: -3, more depending on how far off
    the code is.
  `;
  return text;
}

function eulerPi(n) {
  const sum = Array.from({length: n}, (_, i) => i+1)
    .reduce((acc, e) => acc + 1/(e*e), 0);
  return Math.sqrt(sum*6);
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new EulerPi().qaText());
}
