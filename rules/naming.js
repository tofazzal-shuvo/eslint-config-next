const VAGUE_NAMES = ['data', 'info', 'temp', 'tmp', 'obj', 'val', 'res', 'ret', 'stuff', 'thing', 'foo', 'bar'];

const BASE_NAMING = [
  { selector: 'typeLike', format: ['PascalCase'] },
  { selector: 'function', format: ['camelCase', 'PascalCase'] },
  { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
];

export const namingRules = {
  '@typescript-eslint/naming-convention': ['error', ...BASE_NAMING],
};

export const strictNamingRules = {
  'id-denylist': ['warn', ...VAGUE_NAMES],
  'id-length': ['warn', { min: 2, exceptions: ['_', 'i', 'j'] }],
};

export const booleanNamingRules = {
  '@typescript-eslint/naming-convention': [
    'error',
    ...BASE_NAMING,
    {
      selector: 'variable',
      types: ['boolean'],
      format: ['PascalCase'],
      prefix: ['is', 'has', 'can', 'should', 'was', 'did', 'will'],
    },
  ],
};
