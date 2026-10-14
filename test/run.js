import { ESLint } from 'eslint';
import polygontech from '../index.js';

const CLEAN_FILES = [
  'src/app/(shop)/orders/page.tsx',
  'src/app/(shop)/orders/[id]/page.tsx',
  'src/app/(shop)/orders/_types.ts',
  'src/app/(shop)/orders/_components/OrderTable.tsx',
  'src/app/(shop)/orders/_hooks/useOrders.ts',
  'src/components/ui/Button.tsx',
  'src/lib/utils.ts',
  'src/types/order.ts',
  'src/app/(shop)/billing/page.tsx',
  'src/features/billing/components/InvoiceSummary.tsx',
  'src/features/billing/utils/invoiceTotal.ts',
  'src/stores/cartStore.ts',
  'src/providers/ThemeProvider.tsx',
  'src/lib/db.ts',
];

const BROKEN_FILES = {
  'src/app/(shop)/products/_components/ProductList.tsx': ['no-restricted-imports'],
  'src/app/(shop)/products/random.ts': ['polygontech/no-unknown-files'],
  'src/lib/format.ts': ['boundaries/dependencies'],
  'src/components/MyWidgets/Badge.tsx': ['check-file/folder-naming-convention'],
  'src/components/layout/orderCard.tsx': [
    'check-file/filename-naming-convention',
    'better-tailwindcss/no-restricted-classes',
  ],
  'src/hooks/orders.ts': ['check-file/filename-naming-convention'],
  'src/lib/helpers.ts': ['check-file/filename-blocklist'],
  'src/components/layout/Header.tsx': ['better-tailwindcss/no-conflicting-classes', 'no-restricted-syntax'],
  'src/lib/flags.ts': ['@typescript-eslint/naming-convention', '@typescript-eslint/switch-exhaustiveness-check'],
  'src/lib/messy.ts': [
    'no-console',
    'max-depth',
    'no-else-return',
    'no-nested-ternary',
    'no-param-reassign',
    'no-restricted-syntax',
    'no-restricted-imports',
    'func-style',
    '@typescript-eslint/no-explicit-any',
    '@typescript-eslint/no-non-null-assertion',
    '@typescript-eslint/consistent-type-assertions',
    '@typescript-eslint/consistent-type-definitions',
  ],
};

const EXPECTED_MESSAGES = {
  'src/features/shipping/components/ShippingCost.tsx': ["can't import features/billing"],
  'src/hooks/useInvoice.ts': ["can't import features/billing"],
  'src/lib/payments.ts': ["import 'server-only'"],
  'src/components/layout/ClientBadge.tsx': ['cannot import server code', 'only read NEXT_PUBLIC_'],
  'src/components/layout/index.ts': ['re-export (barrel)'],
  'src/app/(shop)/products/random.ts': ['outside the folder structure'],
};

const FUNCTIONAL_MESSAGES = ['Use const', 'instead of a loop', 'in place', 'Do not delete', 'Classes'];

process.chdir(new URL('./app', import.meta.url).pathname);

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: polygontech({ level: 'strict', fileCase: 'pascal', tailwindEntry: 'src/app/globals.css', typeChecked: true }),
});

const lint = async (file) => {
  const [result] = await eslint.lintFiles([file]);
  return result.messages;
};

const describe = ({ line, ruleId, message }) => `    ${line} ${ruleId}: ${message}`;

const checkClean = async (file) => {
  const messages = await lint(file);
  return messages.length === 0 ? [] : [`${file} should be clean:\n${messages.map(describe).join('\n')}`];
};

const checkBroken = async ([file, ruleIds]) => {
  const found = new Set((await lint(file)).map(({ ruleId }) => ruleId));
  const missing = ruleIds.filter((ruleId) => !found.has(ruleId));
  return missing.length === 0 ? [] : [`${file} should break: ${missing.join(', ')}`];
};

const checkFunctionalMessages = async () => {
  const texts = (await lint('src/lib/messy.ts')).map(({ message }) => message).join('\n');
  const missing = FUNCTIONAL_MESSAGES.filter((text) => !texts.includes(text));
  return missing.length === 0 ? [] : [`messy.ts missing functional bans: ${missing.join(', ')}`];
};

const checkMessages = async ([file, expected]) => {
  const texts = (await lint(file)).map(({ message }) => message).join('\n');
  const missing = expected.filter((text) => !texts.includes(text));
  return missing.length === 0 ? [] : [`${file} missing messages: ${missing.join(', ')}\n${texts}`];
};

const failures = (
  await Promise.all([
    ...CLEAN_FILES.map(checkClean),
    ...Object.entries(BROKEN_FILES).map(checkBroken),
    ...Object.entries(EXPECTED_MESSAGES).map(checkMessages),
    checkFunctionalMessages(),
  ])
).flat();

const total = CLEAN_FILES.length + Object.keys(BROKEN_FILES).length + Object.keys(EXPECTED_MESSAGES).length;
console.info(failures.length === 0 ? `OK: ${total} files behave as expected` : failures.join('\n\n'));
process.exit(failures.length === 0 ? 0 : 1);
