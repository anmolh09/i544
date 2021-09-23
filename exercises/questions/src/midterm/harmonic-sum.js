'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 13:31:31 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class HarmonicSum extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = HarmonicSum;
Object.assign(HarmonicSum, {
  id: 'harmonicSum',
  title: 'Compute Sum of Harmonic Series',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;

function question() {
  let text = '';
  text += `
    The sum .$H(n)$ of the first .$n$ terms of the *harmonic series*
    is given by .$H(n) = \\sum_{i=1}^n i^{-1} = \\frac{1}{1} +
    \\frac{1}{2} + \\frac{1}{3} + \\frac{1}{4} + \\ldots + \\frac{1}{n}$.

    *Subject to the same restrictions as in Homework 1*, write a
    function .~harmonicSum(n).~ which computes the value of .$H(n)$
    where \`n >= 0\`.

    *Examples*:

    ~~~
    > harmonicSum(0)
    0   
    > harmonicSum(1)
    1
    > harmonicSum(2)
    1.5
    > harmonicSum(3)
    1.8333333333333333
    > harmonicSum(10)
    2.9289682539682538
    ~~~

    Show the result of using your function to compute
    \`harmonicSum(20)\`. "${POINTS}-points".
  `;
  return text;
}

function answer() {
  let text = `
~~~
${harmonicSum}
~~~

with log:

~~~
> harmonicSum(20)
3.597739657143682
~~~

*Grading Rubrics*

  + Gross violation of homework 1 restrictions: -6; proportionate if
    less gross.

  + Missing \`harmonicSum(20)\` value: -3

  + Incorrect \`harmonicSum(20)\` value: -3, more depending on how far off
    the code is.
  `;
  return text;
}

function harmonicSum(n) {
  return Array.from({length: n}, (_, i) => i+1)
    .reduce((acc, e) => acc + 1/e, 0);
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new HarmonicSum().qaText());
}
