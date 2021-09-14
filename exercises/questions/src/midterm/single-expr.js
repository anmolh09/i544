'use strict';

const TIMESTAMP = 'Time-stamp: <2021-07-08 15:25:40 umrigar>';

const {Question, Rand, umtParse, emacsTimestampToMillis} =
  require('gen-q-and-a');

const { ol } = require('./util');

class SingleExpr extends Question {

  constructor(params) {
    super(params);
    this.addParamSpec(PARAMS);
    this.freeze();
    this.addQuestion(question(this.params));
    this.addAnswer(answer(this.params));
    this.makeContent();
  }
 
}

module.exports = SingleExpr;
Object.assign(SingleExpr, {
  id: 'singleExpr',
  title: 'Single Expressions',
  timestamp: emacsTimestampToMillis(TIMESTAMP),
  version: '1.0.0',
});

const POINTS = 20;

function question({keys}) {
  let text = '';
  text += `
    Define each of the following functions using a declaration of the
    form .~const fn = ...;~, where \`fn\` is replaced by the specified
    name of the function and the \`...\` should be a fat-arrow
    function whose body *must* consist of *only* a single expression;
    i.e. the body cannot be surrounded by \`{\` and \`}\`.
  `;
  text += ol(keys.map(k => DATA[k].question), 8);
  text += `
    You may use any of the methods available on JavaScript's built-in
    objects. "${POINTS}-points".
  `;
  return text;
}

function answer({keys}) {
  let text = '';
  text += `
    The answers follow:
  `;
  text += ol(keys.map(k => DATA[k].answer), 8);
  text += `
    *Grading Rubrics*: Each part which is correct, but does not meet
    the restriction of a single expression body: -2.
  `;
  return text;
}

const DATA = {
  nonEmptyString: {
    question: `
      A function which is invoked as .~nonEmptyString(s)~ and returns
      .~true~ iff \`s\` is a JavaScript string which contains at
      least one non-whitespace character.

      *Examples*:

      ~~~
      > nonEmptyString('  hello')
      true
      > nonEmptyString('  ')
      false
      > nonEmptyString(' \\t\\n  \\t \\n')
      false
      > nonEmptyString(null)
      false
      > nonEmptyString(undefined)
      false
      > nonEmptyString({})
      false
      > nonEmptyString([])
      false
      ~~~
    `,
    answer: `
      Possibilities include:

      ~~~
      const nonEmptyString = 
        s => typeof s === 'string' && s.trim().length > 0;
      ~~~

      or

      ~~~
      const nonEmptyString = 
        s => typeof s === 'string' && /\\S/.test(s)
      ~~~

      *Grading Rubrics*: -2 if no handling of types other than
      \`String\`.
    `,
  },

  arrayLast: {
    question: `
      A function which is invoked as .~lastElement(arr)~ and
      returns the last element of non-empty array \`arr\`.
    `,
    answer: `
      Possibilities include:

      ~~~
      const lastElement = arr => arr.slice(-1)[0];
      ~~~

      or

      ~~~
      const lastElement = arr => arr[arr.length - 1]
      ~~~
    `
  },

  arrayAverage: {
    question: `
      A function which is invoked as .~arrayAverage(arr)~ and
      returns the average of non-empty numeric array \`arr\`.

      *Examples*: 

      ~~~
      > arrayAverage([1, 2, 3])
      2
      > arrayAverage([1])
      1
      ~~~
    `,
    answer: `
      Use \`reduce()\` to sum the array:

      ~~~
      const arrayAverage =
        arr => arr.reduce((acc, e) => acc + e)/arr.length;
      ~~~

      Since the array is specified to be non-empty we do not
      need to deal with handling the special case of an empty
      array.
    `
  },

  sameElementsArrays: {
    question: `
      A function which is invoked as .~arraySubset(arr1, arr2)~ 
      which returns .~true~ iff every element in .~arr1~ is in
      .~arr2~.

      *Examples*:

      ~~~
      > arraySubset([3, 1, 2], ['a', 1, 3, 2])
      true
      > arraySubset([3, 1, 4], ['a', 1, 3, 2])
      false
      > arraySubset([], ['a', 1, 3, 2])
      true
      ~~~
    `,
    answer: `
      Use \`every\` over .~arr1~:

      ~~~
      const arraySubset =
        (arr1, arr2) => arr1.every(e => arr2.indexOf(e) >= 0);
      ~~~

      or use array \`includes\`:

      ~~~
      const arraySubset =
        (arr1, arr2) => arr1.every(e => arr2.includes(e));
      ~~~
    `
  },

  stringReverse: {
    question: `
      A function which is invoked as .~stringReverse(s)~ and returns
      the reverse of string .~s~.
    `,
    answer: `
      A possible definition:

      ~~~
      const stringReverse = 
        s => s.split('').reverse().join('');
      ~~~
    `,
  },

  arraySplit: {
    question: `
      A function which is invoked as .~arraySplit(arr)~ and returns a
      2-element array \`[lo, hi]\` where \`lo\` is an array containing
      the elements in the lower half of \`arr\`, \`hi\` is an array
      containing the elements in the higher half of \`arr\` and
      \`hi.length - lo.length <= 1\`.

      *Examples*:

      ~~~
      > arraySplit([1, 2])
      [ [ 1 ], [ 2 ] ]
      > arraySplit([1, 2, 3])
      [ [ 1 ], [ 2, 3 ] ]
      > arraySplit([])
      [ [], [] ]
      > arraySplit([1])
      [ [], [ 1 ] ]
      ~~~
    `,
    answer: `
      A possible definition:

      ~~~
      const arraySplit = 
        a => [ a.slice(0, a.length/2), a.slice(a.length/2) ];
      ~~~
    `,
  },

  arrayIntersection: {
    question: `
      A function which is invoked as .~commonArrayElements(arr1, arr2)~ 
      and returns an array containing the elements common to  arrays 
      .~arr1~ and .~arr2~.  You may assume that neither .~arr1~ or .~arr2~
      contain duplicate elements.

      *Examples*:

      ~~~
      > commonArrayElements([2, 7, 3], [6, 3, 2, 9])
      [ 2, 3 ]
      > commonArrayElements(['a', 'b', 'c'], 
                            ['d', 'e'])
      []
      > commonArrayElements(['a', 'b', 'c'], [])
      []
      > commonArrayElements([], ['d', 'e'])
      []
      > 
      ~~~
    `,
    answer: `
      A possible definition:

      ~~~
      const commonArrayElements =
        (arr1, arr2) => arr1.filter(e => arr2.indexOf(e) !== -1);
      ~~~

      Alternately, use array \`includes()\`:

      ~~~
      const commonArrayElements =
        (arr1, arr2) => arr1.filter(e => arr2.includes(e));
      ~~~
    `,
  },
  arrayUnique: {
    question: `
      A function which is invoked as .~uniqueArrayElements(arr)~ 
      and returns an array containing the elements of array .~arr~
      without any duplicates.

      *Examples*:

      ~~~
      > uniqueArrayElements([1, 1, 2, 1, 2, 3])
      [ 1, 2, 3 ]
      > uniqueArrayElements([])
      []
      > uniqueArrayElements(['a', 2, 'a', '3', 3, 'b'])
      [ 'a', 2, '3', 3, 'b' ]
      ~~~
    `,
    answer: `
      Possible definitions:

      ~~~
      const uniqueArrayElements =
        arr => arr.filter((e, i, a) => a.slice(0, i).indexOf(e) < 0);
      ~~~

      or

      ~~~
      const uniqueArrayElements =
        arr => arr.filter((e, i) => arr.indexOf(e) === i);
      ~~~

    `,
  },

  stripBlankLines: {
    question: `
      A function which is invoked as .~removeBlankLines(text)~ 
      and returns string .~text~ with all blank lines removed.
      (a blank line is a maximal sequence of zero-or-more
      whitespace characters terminated by a newline character).

      *Examples*:

      ~~~
      > removeBlankLines('Hello\\n   \\n  World\\n\\n')
      'Hello\\n  World\\n'
      > removeBlankLines('    ')
      '    '
      > removeBlankLines('')
      ''
      ~~~
    `,
    answer: `
      A possible definition:

      ~~~
      const removeBlankLines = 
        text => text.replace(/^\\s*\\n/gm, '');
      ~~~

      Could also be done using .~split('\\n')~ followed by a .~filter()~
      and .~join()~ but there may be problems in handling '\\n' edge-cases.
    `,
  },
  
  stripLeadingSpace: {
    question: `
      A function which is invoked as .~stripLeadingSpace(text)~ and
      returns string .~text~ with all leading spaces ' ' or tabs '\\t'
      on all lines in text removed (a line is defined to be a maximal
      sequence of characters not containing a newline character).

      *Examples*:

      ~~~
      > stripLeadingSpace(' \\t  Hello   \\n   \\t\\n' +
                          '  \\tWorld \\t  \\n')
      'Hello   \\n\\nWorld \\t  \\n'
      > stripLeadingSpace(' \\t  \\n')
      '\\n'
      > stripLeadingSpace('   ')
      ''
      > stripLeadingSpace('')
      ''
      ~~~
    `,
    answer: `
      A possible definition:

      ~~~
      const stripLeadingSpace = 
        text => text.replace(/^[ \\t]+/gm, '');
      ~~~

      Could also be done using .~split('\\n')~ followed by a .~filter()~
      and .~join()~ but there may be problems in handling '\\n' edge-cases.
    `,
  },
  
};


const PARAMS = [
  {
    keys: () => Rand.permutation(Rand.choices(5, Object.keys(DATA))),
  }
];


if (process.argv[1] === __filename) {
  console.log(new SingleExpr().qaText());
}
