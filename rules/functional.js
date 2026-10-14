const MUTATING_ARRAY_METHODS = 'push|pop|shift|unshift|splice|sort|reverse|copyWithin';
const NAVIGATION_OBJECTS = 'router|history';
const FRESH_ARRAY = "[callee.object.type!='ArrayExpression'][callee.object.type!='CallExpression']";
const ALLOWED_ASSIGNMENT_TARGETS = "[left.property.name!='current'][left.property.name!='displayName']";
const BROWSER_GLOBALS = 'window|document|location|globalThis|self';

export const functionalSyntax = [
  {
    id: 'let',
    selector: "VariableDeclaration[kind='let']",
    message: 'Use const. Compute the value with a function or an early return instead of reassigning.',
  },
  {
    id: 'loop',
    selector: 'ForStatement, ForInStatement, ForOfStatement[await=false], WhileStatement, DoWhileStatement',
    message: 'Use map, filter, reduce, some, every or find instead of a loop.',
  },
  {
    id: 'array-mutation',
    selector: `CallExpression[callee.property.name=/^(${MUTATING_ARRAY_METHODS})$/]:not([callee.object.name=/^(${NAVIGATION_OBJECTS})$/])${FRESH_ARRAY}`,
    message: 'This changes the array in place. Use spread, filter, toSorted, toReversed or toSpliced.',
  },
  {
    id: 'object-mutation',
    selector: `AssignmentExpression[left.type='MemberExpression']${ALLOWED_ASSIGNMENT_TARGETS}:not([left.object.name=/^(${BROWSER_GLOBALS})$/]):not([left.object.object.name=/^(${BROWSER_GLOBALS})$/])`,
    message: 'Do not change an object in place. Return a new one: { ...item, field: value }.',
  },
  {
    id: 'delete',
    selector: "UnaryExpression[operator='delete']",
    message: 'Do not delete keys. Build a new object without them: const { key, ...rest } = item.',
  },
  {
    id: 'object-assign',
    selector: "CallExpression[callee.object.name='Object'][callee.property.name='assign'][arguments.0.type!='ObjectExpression']",
    message: 'Object.assign changes its first argument. Use { ...a, ...b }.',
  },
  {
    id: 'class',
    selector: 'ClassDeclaration:not([superClass.name=/Error$/])',
    message: 'Use functions and plain objects. Classes are only for custom Error types.',
  },
];

export const strictFunctionalRules = {
  'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['ref', 'draft', 'state'] }],
  'no-plusplus': 'error',
  'prefer-arrow-callback': 'error',
  'arrow-body-style': ['error', 'as-needed'],
  'func-style': ['error', 'expression', { overrides: { namedExports: 'ignore' } }],
};

export const constRules = {
  'prefer-const': 'error',
  'no-var': 'error',
  'no-param-reassign': 'error',
};
