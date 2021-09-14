'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 13:17:09 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

const { ol } = require('./util');

class CallBind extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = CallBind;
Object.assign(CallBind, {
  id: 'callBind',
  title: 'Call-Bind',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 20;

function question(params) {
  const { vals, v, o, f, keys } = params;
  let text = '';
  text += `
    Given the following definitions:

    ~~~
    _${v}1 = ${vals[0]};
    const ${o}1 = {
      _${v}1: ${vals[1]},
      _${v}2: ${vals[2]},
      ${f}1_1: () => this._${v}1,
      ${f}1_2() { return this._${v}2; },
      ${f}1_3() { return this._${v}1; },
    };
    const ${o}2 = {
      _${v}1: ${vals[3]},
      _${v}2: ${vals[4]},
      ${f}2_1: () => this._${v}1,
      ${f}2_2() { return this._${v}2 },
      ${f}2_3() { return () => this._${v}1; }
    };
    ~~~

    Assuming that the above code is set up in non-strict mode, show
    *expressions* which *call* one of the functions defined above to
    return the following values:
  `;
  const items = keys.map(k => DATA[k].question(params));
  text += ol(items, 8);
  text += `
    Your expressions may use \`globalThis\` but may not
    use any identifiers starting with \`_\`.
    "${POINTS}-points".
  `;
  return text;
}

function answer(params) {
  const { keys } = params;
  let text = `
    The answers follow:
  `;
  const items = keys.map(k => DATA[k].answer(params));
  text += ol(items, 8);
  text += `
    *Grading Rubrics*: Direct access to \`_\` vars in all
    questions or not using provided objects/functions: -15.
  `;
  return text;
}

const DATA = {
  objectAccess: {
    question: ({vals}) => `\`${vals[1]}\`.`,
    answer: ({vals, o, v, f}) => `
      The expression is .~${o}1.${f}1_3()~.  Since \`${f}1_3\`
      is called through \`${o}1\`, .~this~ is set to \`${o}1\`
      and .~this._${v}1~ will evaluate to \`${vals[1]}\`.
    `,
  },
  globalAccess: {
    question: ({vals}) => `\`${vals[0]}\`.`,
    answer: ({vals, o, f, v}) => `
      The expression .~${o}1.${f}1_1()~ will work when run
      within a browser or the nodejs REPL, since .~this~ will
      be set to \`globalThis\` which will access the top-level \`_${v}1\`.
      However, this expression will not work within a nodejs
      *script* where .~this~ is set to the \`exports\` object.

      The expression is .~${o}1.${f}1_3.call(globalThis)~ will work in
      all environments.  Since the \`call()\` method sets .~this~ of
      \`$(o}1.${f}1_3\` to \`globalThis\`, .~this._${v}1~ will
      evaluate to \`${vals[0]}\`.

      *Grading Rubrics*: provide first expression, but not second
      -0.5.
     `,
  },
  objectCall: {
    question: ({vals, o, f}) => `
      \`${vals[4]}\`.  The expression is not allowed to use \`${f}2_2\`.
    `,
    answer: ({vals, o, f, v}) => `
      The expression is .~${o}1.${f}1_2.call(${o}2)~.  Since the
      \`call()\` method sets .~this~ of \`$(o}1.${f}1_2\` to
      \`${o}2\`, .~this._${v}2~ will evaluate to \`${vals[4]}\`.

      *Grading Rubrics*: Uses \`${f}2_2\`: -3
     `,
  },
  doubleCall: {
    question: ({vals, o, f}) => `
      \`${vals[3]}\`.  
    `,
    answer: ({vals, o, f, v}) => `
      The expression is .~${o}2.${f}2_3()()~.  Since \`${f}2_3\`
      is called through \`${o}2\`, .~this~ is set to \`${o}2\`
      and .~this._${v}1~ will evaluate to \`${vals[3]}\`.  Note
      the double-call since \`${f}2_3\` returns a function.  
      Note also that the returned fat-arrow function gets it's
      .~this~ from its containing function.

      *Grading Rubrics*: Miss double call: -2
     `,
  },
};

const PARAMS = [
  { vals: () => Rand.choices(5, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]),
    v:() => Rand.choice(['v', 'x', 'var', 'field']),
    o:() => Rand.choice(['o', 'obj', 'object', ]),
    f:() => Rand.choice(['f', 'g', 'h', 'fn', ]),
    keys: () => Rand.permutation(Object.keys(DATA)),
  },
];


if (process.argv[1] === __filename) {
  console.log(new CallBind().qaText());
}
