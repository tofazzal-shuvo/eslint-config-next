import checkFile from 'eslint-plugin-check-file';

const PASCAL = '+([A-Z])*([a-zA-Z0-9])';
const CAMEL = '+([a-z])*([a-zA-Z0-9])';
const KEBAB = '+([a-z0-9])*(-+([a-z0-9]))';

const NAMES = {
  any: {
    component: `@(${PASCAL}|${KEBAB})`,
    hook: `@(use${PASCAL}|use-${KEBAB})`,
    module: `@(${CAMEL}|${KEBAB})`,
  },
  pascal: { component: PASCAL, hook: `use${PASCAL}`, module: CAMEL },
  kebab: { component: KEBAB, hook: `use-${KEBAB}`, module: KEBAB },
};

const GRAB_BAG_NAMES = '{helpers,helper,misc,common,stuff,general,shared}';

const folderRules = (root) => ({
  [`${root}app/**/`]: 'NEXT_JS_APP_ROUTER_CASE',
  [`${root}{components,hooks,lib,types,utils,config,features,stores,providers,assets,testing}/**/`]: 'KEBAB_CASE',
});

const fileRules = (root, names) => ({
  [`${root}**/{components,_components,providers}/**/*.tsx`]: names.component,
  [`${root}**/{hooks,_hooks}/**/*.{ts,tsx}`]: names.hook,
  [`${root}**/{lib,types,utils,stores,_lib,_utils,_actions,_api,_types}/**/*.ts`]: names.module,
});

export const fileNameConfig = ({ root, fileCase }) => ({
  plugins: { 'check-file': checkFile },
  rules: {
    'check-file/folder-naming-convention': ['error', folderRules(root)],
    'check-file/filename-naming-convention': [
      'error',
      fileRules(root, NAMES[fileCase]),
      { ignoreMiddleExtensions: true },
    ],
    'check-file/filename-blocklist': [
      'error',
      { [`**/${GRAB_BAG_NAMES}.*`]: '*Utils.*', [`**/!(lib)/utils.*`]: '*Utils.*' },
    ],
  },
});
