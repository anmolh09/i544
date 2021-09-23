'use strict';

const assert = require('assert');

const TIMESTAMP = 'Time-stamp: <2021-07-08 01:22:53 umrigar>';

const {Question, Rand, emacsTimestampToMillis} = require('gen-q-and-a');

const { ol } = require('./util');

class Validity extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }

}

module.exports = Validity
Object.assign(Validity, {
  id: 'validity',
  title: 'Discuss Validity',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 15;
function question(params) {
  const ids = params.ids;
  const questions = ol(ids.map(id => DATA[id].question), 8);
  return `
    Discuss the validity of the following statements. "${POINTS}-points"

    ${questions}
  `;
}

function answer(params) {
  const ids = params.ids;
  const answers = ol(ids.map(id => DATA[id].answer), 8);
  return `
    The answers follow:
    ${answers}
  `;
}

const DATA = {
  import: {
    question: `
      It is possible to dynamically import a module whose name is not
      known until runtime by using a statement like 
      \`import module from\` "MODULE" .- \`;\` where "MODULE" is a 
      variable containing the name of the module to be imported.
    `,
    answer: `
      It is not possible to do this using a .~import~ *statement*,
      where the specification of the module must be specified
      statically.  Hence the statement is *false*.  Note that dynamic
      imports can be done using the .~import()~ *function*.   
    `,
  },
  emptyMatch: {
    question: `
      The code fragment .~while (str.match(/[a-zA-Z\\-\`\,]*/g)) 
      { ... }~ is buggy.
    `,
    answer: `
      Since the regex can match an empty string, the .~match()~ will
      alway succeed and the code will go into an infinite loop.  Hence
      the statement is *true*.
    `,
  },
  json: {
    question: `
      All JavaScript array literals specifying an array of
      integers are also JSON array literals.
    `,
    answer: `
      JavaScript array literals allow a trailing comma, whereas
      JSON array literals do not.  Hence the statement is *false*.
    `,
  },
  promiseThen: {
    question: `
      If .~promise~ is a .~Promise~, then .~promise.then()~ returns
      the value with which .~promise~ was resolved.
    `,
    answer: `
      The resolution .~v~ of .~promise., is provided as the
      first argument to the .~then()~ function as .~promise.then(v => ...)~.
      .~promise.then()~ will return a new .~Promise~ and hence the
      statement is *false*.
    `,
  },
  thisInCall: {
    question: `
      If some function \`f()\` is called using \`f.call(o)\`, then
      within the body of \`f()\` .~this~ will refer to \`o\`.
    `,
    answer: `
      .~this~ may already be bound or \`f\` may be a fat-arrow
      \`=>\` function in which case .~this~ is bound lexically.
      Hence the statement is *false*. 
    `,
  },
  argumentsSpread: {
    question: `
      The spread operator can be used to convert the \`arguments\`
      pseudo-array into a real array.
    `,
    answer: `
      \`[ ...arguments ]\` returns a real array.  Hence the
      statement is *true*.
    `,
  },
  asyncConstructor: {
    question: `
      An object .~constructor~ cannot be declared .~async~.
    `,
    answer: `
      A .~constructor~ should return the newly created object
      whereas an .~async~ function must return a \`Promise\`.
      Since those two types are incompatible, we cannot have
      an .~async constructor~ and the statement is *true*.
    `,
  },
  destructuring: {
    question: `
      If there is already a variable \`v\` declared within
      the current scope, then it is not possible to use destructuring 
      to access a property \`v\` of some object \`obj\`.
    `,
    answer: `
      It is possible to specify the name of the variable to
      which the property is destructured using syntax like

      ~~~
      let v;

      const { v: v1 } = obj; //destructure into var v1
      ~~~

      Hence the statement is *false*.
    `,
  },
  generator: {
    question: `
      The body of a generator function is executed when it is 
      called.
    `,
    answer: `
      When a generator function is called, it immediately returns
      an iterator object without executing the body.  Hence
      the statement is *false*.
    `,
  },
  nullish: {
    question: `
      If a variable \`v\` is *nullish*, then \`!v\` is .~true~.
    `,
    answer: `
      If \`v\` is nullish, then its value must be either .~undefined~
      or .~null~.  Since both these values are regarded as falsey within
      boolean contexts, \`!v\` must be .~true~ and the statement is *true*.
    `,
  },
};

const PARAMS = [
  { ids: () => Rand.choices(5, Object.keys(DATA)),
  },
  { _type: 'nonRandom',
    questions: ({ids}) => ids.map(k => DATA[k].question),
    answers: ({ids}) => ids.map(k => DATA[k].answer),
  },
];

if (process.argv[1] === __filename) {
  console.log(new Validity().qaText());
}
