import tailwind from 'eslint-plugin-better-tailwindcss';

const ARBITRARY_VALUE = {
  pattern: '^(.*\\[.+\\])$',
  message: 'Use a theme value instead of the arbitrary "$1". Add it to the theme if it is missing.',
};

export const tailwindConfig = ({ tailwindEntry, ignoreClasses = [] }) => ({
  plugins: { 'better-tailwindcss': tailwind },
  settings: { 'better-tailwindcss': tailwindEntry ? { entryPoint: tailwindEntry } : {} },
  rules: {
    'better-tailwindcss/no-conflicting-classes': 'error',
    'better-tailwindcss/no-duplicate-classes': 'error',
    'better-tailwindcss/no-unknown-classes': ['error', { ignore: ignoreClasses }],
    'better-tailwindcss/no-deprecated-classes': 'error',
    'better-tailwindcss/no-concatenated-classes': 'error',
    'better-tailwindcss/enforce-canonical-classes': 'error',
    'better-tailwindcss/enforce-consistent-class-order': 'error',
    'better-tailwindcss/no-unnecessary-whitespace': 'error',
  },
});

export const strictTailwindRules = {
  'better-tailwindcss/no-restricted-classes': ['warn', { restrict: [ARBITRARY_VALUE] }],
};
