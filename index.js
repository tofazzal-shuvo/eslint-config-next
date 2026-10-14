import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import { flowRules, strictFlowRules, componentSizeRules } from './rules/readability.js';
import { functionalSyntax, strictFunctionalRules, constRules } from './rules/functional.js';
import { classNameTemplateBan, rawElementBans, restrictedImportPaths } from './rules/reuse.js';
import { namingRules, strictNamingRules, booleanNamingRules } from './rules/naming.js';
import { typescriptRules, strictTypescriptRules, typeCheckedRules } from './rules/typescript.js';
import { hygieneRules } from './rules/hygiene.js';
import { structureConfig, SIBLING_PRIVATE_IMPORT, ROUTE_FILES } from './rules/structure.js';
import { reExportBan, clientBoundaryBans, secretEnvBan } from './rules/modules.js';
import { fileNameConfig } from './rules/fileNames.js';
import { nextConfig } from './rules/nextjs.js';
import { tailwindConfig, strictTailwindRules } from './rules/tailwind.js';

const SOURCE_FILES = ['**/*.{js,jsx,mjs,cjs,ts,tsx}'];
const TYPESCRIPT_FILES = ['**/*.{ts,tsx}'];
const COMPONENT_FILES = ['**/*.{jsx,tsx}'];
const TEST_FILES = ['**/*.{test,spec}.{js,jsx,ts,tsx}', '**/{tests,e2e,__tests__,testing}/**'];
const DEFAULT_IGNORES = ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**', '**/next-env.d.ts'];

const LEVELS = {
  recommended: {
    rules: { ...flowRules, ...constRules, ...namingRules, ...typescriptRules, ...hygieneRules },
    syntaxBans: [classNameTemplateBan, reExportBan, ...clientBoundaryBans],
    componentRules: {},
  },
  strict: {
    rules: {
      ...flowRules,
      ...constRules,
      ...namingRules,
      ...typescriptRules,
      ...hygieneRules,
      ...strictFlowRules,
      ...strictFunctionalRules,
      ...strictNamingRules,
      ...strictTypescriptRules,
    },
    syntaxBans: [...functionalSyntax, classNameTemplateBan, reExportBan, ...clientBoundaryBans, ...rawElementBans],
    componentRules: { ...componentSizeRules, ...strictTailwindRules },
  },
};

const isAllowed = (allowSyntax) => ({ id }) => !allowSyntax.includes(id);
const isNot = (banId) => ({ id }) => id !== banId;
const toSyntaxRule = ({ selector, message }) => ({ selector, message });

const syntaxRule = (bans) => ['error', ...bans.map(toSyntaxRule)];

const importRule = (bannedImports, patterns = []) => [
  'error',
  { paths: restrictedImportPaths(bannedImports), patterns },
];

const codeConfig = ({ level, syntaxBans, bannedImports }) => ({
  files: SOURCE_FILES,
  languageOptions: { globals: { ...globals.browser, ...globals.node } },
  linterOptions: { reportUnusedDisableDirectives: 'off' },
  rules: {
    ...level.rules,
    'no-restricted-syntax': syntaxRule(syntaxBans),
    'no-restricted-imports': importRule(bannedImports),
  },
});

const serverCodeFiles = (root) => [
  `${root}{lib,utils,features,hooks,components,providers,stores}/**`,
  `${root}app/**/_*/**`,
  `${root}app/**/_*.{ts,tsx}`,
];

const entryFiles = (root) => [`${root}app/**/${ROUTE_FILES}.{ts,tsx}`, `${root}app/${ROUTE_FILES}.{ts,tsx}`, `${root}*.{ts,tsx}`];

const serverCodeConfig = ({ root, serverBans }) => ({
  files: serverCodeFiles(root),
  rules: { 'no-restricted-syntax': syntaxRule(serverBans) },
});

const uiKitConfig = ({ root, serverBans }) => ({
  files: [`${root}components/ui/**`],
  rules: { 'no-restricted-syntax': syntaxRule(serverBans.filter(isNot('raw-element'))), 'func-style': 'off' },
});

const entryConfig = ({ root, syntaxBans }) => ({
  files: entryFiles(root),
  rules: { 'no-restricted-syntax': syntaxRule(syntaxBans.filter(isNot('re-export'))) },
});

const appConfig = ({ root, bannedImports }) => ({
  files: [`${root}app/**`],
  rules: { 'no-restricted-imports': importRule(bannedImports, [SIBLING_PRIVATE_IMPORT]) },
});

const typeCheckedConfig = {
  files: TYPESCRIPT_FILES,
  languageOptions: { parserOptions: { projectService: true } },
  rules: { ...typeCheckedRules, ...booleanNamingRules },
};

const testConfig = {
  files: TEST_FILES,
  rules: {
    'max-lines-per-function': 'off',
    'max-lines': 'off',
    'id-length': 'off',
    'no-restricted-syntax': 'off',
    'react-hooks/rules-of-hooks': 'off',
  },
};

export default function tofazzal({
  level = 'recommended',
  srcDir = 'src',
  fileCase = 'any',
  tailwindEntry,
  ignoreClasses,
  bannedImports,
  allowSyntax = [],
  typeChecked = false,
  ignores = [],
  rules = {},
} = {}) {
  const root = srcDir === '.' ? '' : `${srcDir.replace(/\/$/, '')}/`;
  const chosen = LEVELS[level];
  const syntaxBans = chosen.syntaxBans.filter(isAllowed(allowSyntax));
  const serverBans = [...syntaxBans, secretEnvBan].filter(isAllowed(allowSyntax));

  return [
    { ignores: [...DEFAULT_IGNORES, ...ignores] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactHooks.configs.flat.recommended,
    nextConfig,
    prettier,
    codeConfig({ level: chosen, syntaxBans, bannedImports }),
    serverCodeConfig({ root, serverBans }),
    uiKitConfig({ root, serverBans }),
    entryConfig({ root, syntaxBans }),
    appConfig({ root, bannedImports }),
    { files: SOURCE_FILES, ...structureConfig(root) },
    { files: SOURCE_FILES, ...fileNameConfig({ root, fileCase }) },
    { files: COMPONENT_FILES, ...tailwindConfig({ tailwindEntry, ignoreClasses }) },
    ...(typeChecked ? [typeCheckedConfig] : []),
    { files: COMPONENT_FILES, rules: chosen.componentRules },
    testConfig,
    { files: SOURCE_FILES, rules },
  ];
}
