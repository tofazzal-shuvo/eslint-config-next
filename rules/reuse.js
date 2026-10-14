const RAW_CONTROLS = ['button', 'input', 'textarea', 'select'];

const rawControlBan = (tag) => ({
  id: 'raw-element',
  selector: `JSXOpeningElement[name.name='${tag}']`,
  message: `Use a component from components/ui instead of a raw <${tag}>, so every ${tag} looks and behaves the same.`,
});

export const classNameTemplateBan = {
  id: 'classname-template',
  selector: "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral[expressions.length>0]",
  message: "Use cn('base', condition && 'class') instead of building className with a template string.",
};

export const rawElementBans = RAW_CONTROLS.map(rawControlBan);

const LODASH_PATH = { name: 'lodash', message: "Import one method: import uniqBy from 'lodash/uniqBy'." };

export const restrictedImportPaths = (bannedImports = []) => [LODASH_PATH, ...bannedImports];
