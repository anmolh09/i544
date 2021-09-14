'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 15:06:11 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class Promises extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = Promises;
Object.assign(Promises, {
  id: 'promises',
  title: 'Promises',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;

function question() {
  let text = '';
  text += `
    Answer these independent questions on .~async~ functions:

      # Given an .~async~ function \`f()\` which succeeds with an
        integer value \`val\`, how can you run it in the nodejs REPL
        so that you execute \`console.log(val*2)\` when it succeeds
        and execute \`console.log('FAILS')\` when it fails.

      # Given .~async~ functions \`f1()\` and \`f2()\`, how can you
        set things up so as to run \`f1()\` and \`f2()\` in parallel
        and then \`console.log()\` the success or error result of the
        function which completes first.

    WLOG, assume that all functions above are invoked without any
    arguments. "${POINTS}-points"
  `;
  return text;
}

function answer() {
  let text = `
    The answers follow:

      # Since the nodejs REPL does not allow top-level .~await~,
        and an .~async~ function must return a \`Promise\`
        we can use a \`then-catch\` chain off the return value.

        ~~~
        > f()
            .then(v => console.log(2*v))
            .catch(_ => console.log('FAILS');
        ~~~

        Alternatively, use an .~await~ within an IIFE.

        ~~~
        >(async () => {
           try {
             const v = await f();
             console.log(2*v);
           }
           catch (_) {
             console.log('FAILS');
           } 
          })();
        ~~~

        *Grading Rubrics*: -4 if no grasp of why promises or await
        necessary.        

      # We need to race the two functions in parallel:

        ~~~
        Promise.race([f1(), f2()])
          .then(v => console.log(v))
          .catch(err => console.log(err));
        ~~~

        *Grading Rubrics*: -4 if no mention of \`Promise.race()\`.
  `;
  return text;
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new Promises().qaText());
}







