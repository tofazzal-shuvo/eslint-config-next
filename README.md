# eslint-config-next-clean

One ESLint preset for **any Next.js (App Router) + TypeScript + Tailwind project**. It enforces one folder structure and one code style, so nobody can add files in random places, mutate state, or leave unreadable code behind.

It knows nothing about your project. Install it and the rules apply.

Every rule below says **why** it exists and shows **bad → good**. When a rule blocks you, its message tells you what to write instead.

## Install

```bash
npm i -D eslint-config-next-clean eslint typescript
```

```js
// eslint.config.mjs
import nextClean from 'eslint-config-next-clean';

export default nextClean({ tailwindEntry: 'src/app/globals.css' });
// or: nextClean({ level: 'strict', tailwindEntry: 'src/app/globals.css' })
```

## Options

All optional.

| Option | Default | What it does |
|---|---|---|
| `level` | `'recommended'` | `'recommended'`: bugs, structure, Tailwind correctness, TypeScript safety — fits any project. `'strict'`: adds the functional style and the naming and size opinions (see below) |
| `tailwindEntry` | — | Your Tailwind CSS file. Needed on Tailwind v4 to catch unknown classes |
| `ignoreClasses` | `[]` | Regex list of your own CSS classes, so they are not reported as unknown: `['^date-field-picker$']` |
| `srcDir` | `'src'` | Use `'.'` if `app/` sits at the project root |
| `fileCase` | `'any'` | `'any'` accepts `OrderTable.tsx` or `order-table.tsx`. `'pascal'` or `'kebab'` enforces one |
| `typeChecked` | `false` | Adds rules that need type info: boolean names, exhaustive `switch`, unawaited promises. Slower |
| `bannedImports` | `[]` | Imports your project replaced: `[{ name: 'moment', message: 'Use date-fns.' }]` |
| `allowSyntax` | `[]` | Turn a pattern ban off by id: `let`, `loop`, `array-mutation`, `object-mutation`, `delete`, `object-assign`, `class`, `raw-element`, `classname-template`, `re-export`, `client-boundary`, `server-only` |
| `ignores` / `rules` | — | Extra ignore globs / override any rule |

## Levels

| | `recommended` | `strict` adds |
|---|---|---|
| Structure (§1) | everything, including barrels and the server/client boundary | — |
| Flow (§2) | `max-depth` 3, no else-after-return, no nested ternary, `complexity` 15 | `max-depth` 2, `complexity` 10, size limits, `max-params` |
| Functional (§3) | `prefer-const`, `no-var`, no param reassign | no `let`, loops, mutation, `delete`, classes; arrow functions |
| Names (§4) | PascalCase types | vague and 1-letter names |
| UI (§5) | `cn()` over template strings, Next.js rules | raw `<button>`/`<input>` outside `components/ui` |
| Tailwind (§6) | everything except arbitrary values | arbitrary values (warn) |
| TypeScript (§7) | no `any`, no `!`, type imports | no `as` casts, `type` over `interface` |

Sections below mark strict-only rules with **(strict)**.


---

## 1. Folder structure

Code lives next to the route that uses it. It moves to a shared folder only when a second route needs it. A large domain that many routes use (billing, auth) can live in `features/<name>/` instead.

```
src/
  app/
    layout.tsx
    (shop)/
      orders/
        page.tsx              route files: page, layout, loading, error, route…
        _components/          OrderTable.tsx — only this route (and its child routes) may use it
        _hooks/               useOrders.ts
        _actions/             createOrder.ts
        _utils/               orderTotal.ts
        _types.ts             or a _types/ folder when one file is not enough
        [id]/
          page.tsx            may use ../_components (parent route)
  components/
    ui/                       Button, Input — the design system
    <group>/                  shared components, e.g. layout/Header.tsx
    providers/ (optional)     ThemeProvider.tsx — treated like components/
  features/ (optional)        big domains used by many routes, e.g. features/billing/{components,hooks,utils,api}
  hooks/                      hooks used by 2+ routes
  stores/ (optional)          global state (zustand, jotai…)
  lib/  (or utils/, config/, assets/)  pure helpers and settings used by 2+ routes (lib/utils.ts for cn() is fine)
  types/ or types.ts          types used by 2+ routes
  middleware.ts, env.ts…      root files
  pages/                      Pages Router files, if you still have them
  tests/, e2e/, testing/      test code, ignored by the structure rules
```

**Who may import whom:**

| From | May import | Why |
|---|---|---|
| a route (`page.tsx`, `_folders`) | its own `_folders` and its parents', `features`, `components`, `hooks`, `stores`, `lib`, `types` | A route's private code belongs to it. |
| a route | **another route's** `_folders` ✗ | Two routes sharing private code means it isn't private. Move it to `components/`, `hooks/` or `lib/`. |
| `features/billing/` | itself, `components`, `hooks`, `stores`, `lib`, `types` | — |
| `features/billing/` | **another feature** ✗ | Features that import each other become one tangled feature. Combine them in the route instead. |
| `components/` | `components/ui`, `components`, `hooks`, `stores`, `lib`, `types` | Shared code must not depend on a route or a feature. |
| `components/ui/` | `ui`, `lib`, `types` | The design system is the bottom layer; it knows nothing about features. |
| `hooks/` | `hooks`, `stores`, `lib`, `types` | — |
| `stores/` | `stores`, `lib`, `types` | — |
| `lib/` | `lib`, `types` | Helpers stay pure; a helper that imports UI is not a helper. |
| anything | a `page.tsx` / `layout.tsx` ✗ | Route files are entry points, not libraries. |

| Rule | Why | Bad → Good |
|---|---|---|
| no unknown files | A file outside the structure is where garbage starts. In `app/`, only Next.js route files and `_private` files are allowed. | `app/orders/temp.ts` → `app/orders/_utils/orderTotal.ts` |
| folder names | One look tells you what a folder is. `app/` follows Next.js (`(group)`, `[id]`, `_private`, `@slot`); everything else is kebab-case. | `components/MyWidgets/` → `components/my-widgets/` |
| file names | Components `OrderTable.tsx` or `order-table.tsx`, hooks `useOrders.ts` or `use-orders.ts`, helpers `orderTotal.ts` or `order-total.ts`. Pick one with `fileCase`. | `components/orderCard.tsx` → `OrderCard.tsx`; `hooks/orders.ts` → `useOrders.ts` |
| no grab-bag files | `helpers.ts`, `misc.ts`, `common.ts` grow forever and nobody knows what's inside. | `lib/helpers.ts` → `lib/formatMoney.ts` |
| no barrel files (re-exports) | An `index.ts` that re-exports a folder makes every import load the whole folder: slower builds and tests, broken tree-shaking, circular imports. Route and root files may re-export (`export { auth as middleware }`). | `export * from './Button'` in `index.ts` → `import { Button } from '@/components/ui/Button'` |
| `'use client'` can't import server code | A client file is sent to the browser. `next/headers`, `fs`, `server-only` and Node modules don't work there. | `'use client'; import { cookies } from 'next/headers'` → read cookies in the page and pass them as props |
| `'use client'` reads only `NEXT_PUBLIC_` env | Other env vars are `undefined` in the browser, so the code silently breaks. | `process.env.API_URL` → `process.env.NEXT_PUBLIC_API_URL`, or read it on the server |
| secrets need `import 'server-only'` | A file that reads `*_SECRET`, `*_KEY`, `*_TOKEN`, `*_PASSWORD` or `DATABASE_*` must start with `import 'server-only'`. Then importing it into a client component fails the build instead of shipping your server code to the browser. Files with `'use server'` are fine. | `export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)` → add `import 'server-only'` on line 1 |

## 2. Short, flat functions — read top to bottom

A function should read like a list of steps. Each step has a name; the details live in small helpers.

```ts
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const order = OrderSchema.safeParse(await request.json());
  if (!order.success) return badRequest(order.error);

  return Response.json(await createOrder(order.data));
}
```

| Rule | Why | Bad → Good |
|---|---|---|
| `max-depth: 3` (2 in strict) | Code three levels deep makes you hold every condition in your head. Return early instead. | `if (a) { if (b) { if (c) {…} } }` → `if (!a) return; if (!b) return; …` |
| `no-else-return` | After a `return`, the `else` only adds one more level. | `if (x) return 1; else return 2;` → `if (x) return 1; return 2;` |
| `no-lonely-if` | An `if` alone inside an `else` is just an `else if`. | `else { if (b) {…} }` → `else if (b) {…}` |
| `no-nested-ternary` | `a ? (b ? 1 : 2) : 3` needs to be read three times. | → a named function with early returns |
| `no-unneeded-ternary` | `x ? true : false` is just `x`. | `isOn ? true : false` → `isOn` |
| `complexity: 15` (10 in strict, warn) | Many branches in one function means it does several jobs. | → split into named steps |
| `max-params: 3` (warn, strict) | Four arguments are easy to pass in the wrong order. | `make(a, b, c, d)` → `make({ name, size, color, owner })` |
| `max-lines-per-function: 30` (warn, strict) | A function that doesn't fit on one screen hides its steps. Components get 150. | → extract named helpers |
| `max-lines: 200` per file (warn, strict) | Big files usually hold more than one job. | → one file per job |

## 3. Functional style — no changing things in place

When values never change after they're created, you can read any line without tracking what happened earlier. React depends on this too: it only re-renders when it gets a **new** object.

| Rule | Why | Bad → Good |
|---|---|---|
| no `let` (strict) | A `let` can change anywhere below it; you must read the whole function to know its value. | `let total = 0; for (…) total += x;` → `const total = sum(items)` |
| no loops (strict; `for await` allowed) | `map`/`filter`/`reduce` say *what* you want; a loop makes you read *how*. | `for (const o of orders) if (o.isPaid) out.push(o)` → `orders.filter(isPaid)` |
| no array mutation (strict) | `push`, `splice`, `sort`, `reverse` change the original. React state changed this way does not re-render. | `list.sort()` → `list.toSorted()`; `list.push(x)` → `[...list, x]` |
| no object mutation (strict) | Changing a shared object breaks other code using it. `ref.current`, `displayName`, `window`/`document` are allowed. | `order.status = 'paid'` → `{ ...order, status: 'paid' }` |
| no `delete` (strict) | Same as above, and it changes the object's shape. | `delete user.password` → `const { password, ...safeUser } = user` |
| no `Object.assign(target, …)` (strict) | It changes `target`. | `Object.assign(a, b)` → `{ ...a, ...b }` |
| `no-param-reassign` | The caller's value changes behind their back. | `item.count++` → `return { ...item, count: item.count + 1 }` |
| `no-plusplus` (strict) | `i++` is a hidden mutation and easy to misread. | `count++` → `count + 1` |
| `prefer-const`, `no-var` | `const` tells the reader "this never changes". | `let x = 1` (never changed) → `const x = 1` |
| `func-style: expression` (strict) | All functions look the same: `const name = () =>`. Exported functions are allowed (`export default function Page`). | `function helper() {}` → `const helper = () => {}` |
| `prefer-arrow-callback`, `arrow-body-style` (strict) | Short callbacks stay short. | `x.map(function (a) { return a.id; })` → `x.map((a) => a.id)` |
| no `class` (except `Error`) (strict) | See below. | `class OrderService { … }` → a module of functions |

**Why no classes?** React and Next.js don't forbid them — this is a choice. Hooks only work in function components, so React code is already functional. Classes add `this` and state that changes over time, and inheritance hides behavior in a parent class: to understand one method you read the whole chain. A class with only static methods is just a module. Custom `Error` classes stay allowed because `instanceof` needs them. If a library requires classes, use `allowSyntax: ['class']`.

## 4. Names a newcomer understands

| Rule | Why | Bad → Good |
|---|---|---|
| vague names (warn, strict) | `data`, `info`, `temp`, `obj`, `res`, `val` say nothing about what is inside. | `const data = await getOrders()` → `const orders = await getOrders()` |
| no 1-letter names (warn, strict) | `o`, `x`, `e` make the reader guess. `_`, `i`, `j` are fine. | `orders.map((o) => o.id)` → `orders.map((order) => order.id)` |
| PascalCase types, camelCase functions | One look tells you if a name is a type, a value, or a constant. | `type order_row` → `type OrderRow` |
| booleans start with `is/has/can/should` (`typeChecked`) | `open` could be a function or a flag; `isOpen` can only be yes/no. | `const loading = …` → `const isLoading = …` |

## 5. One way to build UI

| Rule | Why | Bad → Good |
|---|---|---|
| no raw `<button>`, `<input>`, `<textarea>`, `<select>` outside `components/ui` (strict) | Styled controls are built once in `components/ui`, so every button has the same look, focus ring and disabled state. | `<button className="…">` → `<Button variant="ghost">` |
| no template string in `className` | Conditions inside a string are hard to read and easy to break with a missing space. | ``className={`box ${isOn ? 'on' : ''}`}`` → `className={cn('box', isOn && 'on')}` |
| no full `lodash` import | Pulls the whole library into the bundle. | `import _ from 'lodash'` → `import uniqBy from 'lodash/uniqBy'` |
| Next.js `core-web-vitals` | `<img>` skips Next's image resizing and lazy loading, so pages load slower. | `<img src=…>` → `<Image src=… width height>` |

## 6. Tailwind

| Rule | Why | Bad → Good |
|---|---|---|
| no conflicting classes | `p-2 p-4` — only one wins, and which one depends on CSS order. | `p-2 p-4` → `p-4` |
| no duplicate classes | Noise. | `flex flex` → `flex` |
| no unknown classes | A typo like `felx` silently does nothing. | `felx` → `flex` |
| no deprecated classes | Old names break on the next Tailwind upgrade. | `rounded` (v4) → `rounded-sm` |
| no arbitrary values (warn, strict) | `w-[123px]` and `text-[#3b82f6]` skip the design system; every screen ends up slightly different. | `w-[123px]` → `w-32`; add missing values to the theme |
| canonical classes | One way to write the same thing. | `px-2 py-2` → `p-2` |
| consistent class order | Easier to scan and to diff. Auto-fixable. | — |
| no concatenated classes | `'bg-' + color` can't be found by Tailwind and is never generated. | `` `bg-${color}` `` → a map `{ red: 'bg-red-500' }[color]` |

## 7. TypeScript — let the compiler catch bugs

| Rule | Why | Bad → Good |
|---|---|---|
| no `any` | `any` turns type checking off; the bug shows up at runtime instead. | `(value: any)` → `(value: Order)`, or `unknown` + a zod parse |
| no `!` | `user!.name` crashes when `user` is missing; `!` only hides the warning. | `user!.name` → `if (!user) return; user.name` |
| no `as` casts (`as const` is fine) (strict) | A cast tells the compiler "trust me", and it stops checking. | `body as Order` → `OrderSchema.parse(body)` |
| `type` over `interface` (strict) | One way to declare shapes; `interface` can be merged silently from another file. | `interface Props {}` → `type Props = {}` |
| `consistent-type-imports` | Type-only imports disappear at build time and stay out of client bundles. | `import { Order }` → `import type { Order }` |
| `no-duplicate-imports` | Two import lines from one module are easy to miss. | → one line |
| `no-unused-vars` | Dead code makes readers wonder what it's for. Prefix with `_` if it must stay. | — |
| exhaustive `switch` (`typeChecked`) | When a union gets a new case, every `switch` that forgets it fails. | add the missing `case`, or use a handler map |
| `no-floating-promises` (`typeChecked`) | A promise nobody awaits fails silently. | `save()` → `await save()` or `void save()` |
| `prefer-nullish-coalescing` (`typeChecked`) | `\|\|` also replaces `0` and `''`. | `count \|\| 10` → `count ?? 10` |
| `no-unnecessary-condition` (`typeChecked`) | Checks that can never be false are noise. | `if (user)` when `user` is never null → remove |

## 8. Hygiene

| Rule | Why | Bad → Good |
|---|---|---|
| `no-console` | Console logs leak into production. Use a logger. | `console.log(order)` → `logger.info('order created', { id })` |
| `eqeqeq` | `==` converts types: `0 == ''` is `true`. | `a == b` → `a === b` |
| `object-shorthand` | `{ name: name }` repeats itself. | → `{ name }` |
| `prefer-template` | `'Hi ' + name + '!'` is harder to read. | → `` `Hi ${name}!` `` |
| `react-hooks` recommended | Hooks in the wrong order or with missing dependencies cause bugs that are hard to reproduce. | — |
| Prettier | Formatting is Prettier's job, so ESLint formatting rules are off. | — |

## What ESLint can't check

A reviewer (or the matching Claude Code skill) still needs to check these:

- **Is the name clear?** ESLint catches `data`, but not a name that is technically true and still confusing.
- **Is this logic already written somewhere?** Search before writing a helper.
- **Errors as values.** Prefer returning `{ ok: false, error }` over `throw` for expected failures.
- **Pure core, side effects at the edges.** Keep API calls, storage and logging in thin outer functions; keep the logic between them pure.
