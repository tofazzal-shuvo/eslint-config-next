export const flowRules = {
  'max-depth': ['error', 3],
  'no-else-return': ['error', { allowElseIf: false }],
  'no-lonely-if': 'error',
  'no-nested-ternary': 'error',
  'no-unneeded-ternary': 'error',
  complexity: ['warn', 15],
};

export const strictFlowRules = {
  'max-depth': ['error', 2],
  complexity: ['warn', 10],
  'max-params': ['warn', 3],
  'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['warn', { max: 30, skipBlankLines: true, skipComments: true }],
};

export const componentSizeRules = {
  'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
};
