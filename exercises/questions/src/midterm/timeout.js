'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 15:20:31 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

class Timeout extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = Timeout;
Object.assign(Timeout, {
  id: 'timeout',
  title: 'Timeout',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;

function question() {
  let text = '';
  text += `
    A remote asynchronous function \`f()\` takes some initial
    arguments plus a callback argument \`cb\` which should be a single
    argument function.  The function uses the initial arguments to
    start an asynchronous operation.  When the asynchonous operation
    completes with result \`res\`, \`f()\` will call \`cb(res)\`.

    Show code for a function .~timeoutCall(timeoutMillis, fn,
    ...args)~ which ."returns" the ."result" of calling remote
    asynchronous function \`fn\` with initial arguments \`...args\`.
  
    If the call to \`f()\` takes longer than \`timeoutMillis\`
    milliseconds, then \`timeoutCall()\` should ."throw" an \`Error\`
    with \`message\` set to 'timeout exceeded'.

    Your implementation should take care of cleaning up any timers.
    "${POINTS}-points"
  `;
  return text;
}

function answer() {
  let text = `
~~~
${timeoutCall}
~~~

*Grading Rubrics*:

  + No attempt to use a \`Promise\`: -5.

  + Not clearing timer: -0.5
  `;
  return text;
}

function timeoutCall(timeoutMillis, fn, ...args) {
  return new Promise((resolve, reject) => {
    let timer;
    const timeoutFn = () => {
      clearTimeout(timer);
      reject(new Error('timeout exceeded'));
    };
    timer = setTimeout(timeoutFn, timeoutMillis);
    fn(...args, res => { clearTimeout(t); resolve(res) });
  });
}


const PARAMS = [
];


if (process.argv[1] === __filename) {
  console.log(new Timeout().qaText());
}



