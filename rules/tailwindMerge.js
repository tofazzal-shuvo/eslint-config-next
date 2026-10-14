import { createRequire } from 'node:module';
import path from 'node:path';

const MERGE_SENSITIVE_RULES = [
  'enforce-consistent-class-order',
  'enforce-canonical-classes',
  'no-deprecated-classes',
  'no-duplicate-classes',
];

const QUOTES = /^[`'"}]+|[`'"]+$|\$\{$/g;

const loadTwMerge = (cwd) => {
  try {
    return createRequire(path.join(cwd, 'package.json'))('tailwind-merge').twMerge;
  } catch {
    return undefined;
  }
};

const classesOf = (text) => text.replace(QUOTES, '').split(/\s+/).filter(Boolean);

const droppedBy = (twMerge, classes) => {
  const kept = new Set(twMerge(classes.join(' ')).split(/\s+/));
  return classes.filter((name) => !kept.has(name)).sort().join(' ');
};

const captureFix = (fix) => {
  const operation = {};
  fix({
    replaceTextRange: (range, text) => Object.assign(operation, { range, text }),
  });
  return operation;
};

const mergeChange = ({ sourceCode }, twMerge, { range, text }) => {
  const node = sourceCode.getNodeByRangeIndex(range[0]);
  if (!node) return undefined;
  const [start, end] = node.range;
  const before = sourceCode.text.slice(start, end);
  const after = before.slice(0, range[0] - start) + text + before.slice(range[1] - start);
  const droppedBefore = droppedBy(twMerge, classesOf(before));
  const droppedAfter = droppedBy(twMerge, classesOf(after));
  return droppedBefore === droppedAfter ? undefined : { droppedBefore, droppedAfter };
};

const explain = ({ droppedBefore, droppedAfter }) =>
  ` Not auto-fixed: inside cn() / tailwind-merge this changes which class wins ` +
  `(ignored before: ${droppedBefore || 'none'}; ignored after: ${droppedAfter || 'none'}). ` +
  'Remove the class that has no effect, then run the fix again.';

const mergeSafe = (rule) => ({
  ...rule,
  create: (context) => {
    const twMerge = loadTwMerge(context.cwd);
    if (!twMerge) return rule.create(context);
    const report = (descriptor) => {
      if (!descriptor.fix) return context.report(descriptor);
      const change = mergeChange(context, twMerge, captureFix(descriptor.fix));
      if (!change) return context.report(descriptor);
      const { fix, ...rest } = descriptor;
      return context.report({ ...rest, message: `${descriptor.message}${explain(change)}` });
    };
    return rule.create(Object.create(context, { report: { value: report } }));
  },
});

export const withMergeSafeFixes = (plugin) => ({
  ...plugin,
  rules: {
    ...plugin.rules,
    ...Object.fromEntries(MERGE_SENSITIVE_RULES.map((name) => [name, mergeSafe(plugin.rules[name])])),
  },
});
