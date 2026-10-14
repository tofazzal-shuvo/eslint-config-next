import boundaries from 'eslint-plugin-boundaries';

const NEXT_ROUTE_FILES = [
  'page',
  'layout',
  'template',
  'loading',
  'error',
  'global-error',
  'not-found',
  'forbidden',
  'unauthorized',
  'default',
  'route',
  'opengraph-image',
  'twitter-image',
  'icon',
  'apple-icon',
  'sitemap',
  'robots',
  'manifest',
];

export const routeFilesGlob = (extraRouteFiles = []) => `{${[...NEXT_ROUTE_FILES, ...extraRouteFiles].join(',')}}`;

const elementsFor = (root) => [
  { type: 'ui', pattern: `${root}components/ui`, partialMatch: false },
  { type: 'component', pattern: `${root}components`, partialMatch: false },
  { type: 'hook', pattern: `${root}hooks`, partialMatch: false },
  { type: 'lib', pattern: `${root}lib`, partialMatch: false },
  { type: 'lib', pattern: `${root}utils`, partialMatch: false },
  { type: 'lib', pattern: `${root}config`, partialMatch: false },
  { type: 'lib', pattern: `${root}assets`, partialMatch: false },
  { type: 'type', pattern: `${root}types`, partialMatch: false },
  { type: 'store', pattern: `${root}stores`, partialMatch: false },
  { type: 'component', pattern: `${root}providers`, partialMatch: false },
  { type: 'feature', pattern: `${root}features/*`, partialMatch: false, capture: ['feature'] },
];

const filesFor = (root, routeFiles) => [
  { category: 'route', pattern: `${root}app/**/${routeFiles}.{ts,tsx}`, capture: ['route', 'file'] },
  { category: 'route', pattern: `${root}app/${routeFiles}.{ts,tsx}`, capture: ['file'] },
  { category: 'private', pattern: `${root}app/**/_*/**/*`, capture: ['route', 'folder', 'path', 'file'] },
  { category: 'private', pattern: `${root}app/**/_*`, capture: ['route', 'file'] },
  { category: 'private', pattern: `${root}app/_*/**/*`, capture: ['folder', 'path', 'file'] },
  { category: 'route', pattern: `${root}pages/**/*.{ts,tsx}` },
  { category: 'type', pattern: `${root}types.ts` },
  { category: 'root', pattern: `${root}*.{ts,tsx}` },
];

const DEPENDENCY_MESSAGE =
  "{{#if from.captured.feature}}features/{{from.captured.feature}}{{else if from.type}}A {{from.type}} file{{else}}This file{{/if}} can't import {{#if to.captured.feature}}features/{{to.captured.feature}}{{else if to.type}}{{to.type}} code{{else}}this file{{/if}}. " +
  'Imports go one way: routes → features → components, hooks, stores → lib, types. ' +
  'A feature never imports another feature, and nothing imports a page or layout. ' +
  'Move the shared part down to lib/, hooks/ or components/.';

const UNKNOWN_FILE_MESSAGE =
  'This file is outside the folder structure. In app/, use a route file (page, layout, route…) or a _folder ' +
  '(_components, _hooks, _utils…). Elsewhere, use components/, hooks/, lib/, types/, stores/ or features/<name>/.';

const withMessage = (rule, message) => ({
  meta: rule.meta,
  create: (context) =>
    rule.create(Object.create(context, { report: { value: ({ node }) => context.report({ node, message }) } })),
});

const structurePlugin = {
  rules: { 'no-unknown-files': withMessage(boundaries.rules['no-unknown-files'], UNKNOWN_FILE_MESSAGE) },
};

const toTypes = (types) => ({ to: { element: { types: { anyOf: types } } } });
const toFiles = (categories) => ({ to: { file: { categories: { anyOf: categories } } } });

const SHARED = ['ui', 'component', 'hook', 'lib', 'type', 'store'];

const toSameFeature = {
  to: { element: { types: 'feature', captured: { feature: '{{ from.element.captured.feature }}' } } },
};

const POLICIES = [
  { from: { file: { categories: 'route' } }, allow: [toTypes([...SHARED, 'feature']), toFiles(['type', 'private'])] },
  { from: { file: { categories: 'private' } }, allow: [toTypes([...SHARED, 'feature']), toFiles(['type', 'private'])] },
  { from: { element: { type: 'feature' } }, allow: [toSameFeature, toTypes(SHARED), toFiles(['type'])] },
  { from: { element: { type: 'component' } }, allow: [toTypes(SHARED), toFiles(['type'])] },
  { from: { element: { type: 'ui' } }, allow: [toTypes(['ui', 'lib', 'type']), toFiles(['type'])] },
  { from: { element: { type: 'hook' } }, allow: [toTypes(['hook', 'lib', 'type', 'store']), toFiles(['type'])] },
  { from: { element: { type: 'store' } }, allow: [toTypes(['store', 'lib', 'type']), toFiles(['type'])] },
  { from: { element: { type: 'lib' } }, allow: [toTypes(['lib', 'type']), toFiles(['type'])] },
  { from: { element: { type: 'type' } }, allow: [toTypes(['type']), toFiles(['type'])] },
  { from: { file: { categories: 'root' } }, allow: [toTypes(['lib', 'type']), toFiles(['type'])] },
];

export const structureConfig = (root, routeFiles) => ({
  plugins: { boundaries, 'next-clean': structurePlugin },
  settings: {
    'boundaries/elements': elementsFor(root),
    'boundaries/files': filesFor(root, routeFiles),
    'boundaries/include': [`${root}**/*`],
    'boundaries/ignore': ['**/*.{test,spec}.{ts,tsx}', '**/*.d.ts', `${root}{test,tests,e2e,__tests__,testing}/**`, '**/__tests__/**'],
    'import/resolver': { typescript: { alwaysTryTypes: true } },
  },
  rules: {
    'boundaries/dependencies': ['error', { default: 'disallow', message: DEPENDENCY_MESSAGE, policies: POLICIES }],
    'next-clean/no-unknown-files': 'error',
  },
});

export const SIBLING_PRIVATE_IMPORT = {
  regex: '^(?!(?:\\.{1,2}/)+_)(?:@/|~/|\\.).*(?:^|/)_[^/]+',
  message:
    "Private _folders belong to their route. Import them only from the same route or a child route (./_x, ../_x). Used by two routes? Move it to components/, hooks/ or lib/.",
};
