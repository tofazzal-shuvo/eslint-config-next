---
name: frontend-clean-code
description: Use whenever writing, editing, reviewing or cleaning frontend code (React, Next.js, Vite, TS/JS) in any project — new components, hooks, utils, features, refactors, "make this readable", "clean this folder". Sets short flat functions, functional style (no mutation, no loops, no classes), co-location folder layout, naming rules, reuse-first rules and the done checklist.
---

# Frontend clean code

Write code clean the first time, so no project ever needs a big readability refactor.

## 0. Read the project first

Before writing, find out (from the project's `CLAUDE.md`, `src/components/ui`, `src/utils`, `package.json`):

- **UI kit** — Button, Input, Textarea, Card, Dialog, DropdownMenu, Collapsible… Never write raw `<button>`, `<input>`, `<textarea>` when the kit has one.
- **Shared utils** — `*Utils.ts`, `lib/`, `hooks/`. Search before writing any helper.
- **Libraries already installed** — lodash (per-method import `lodash/uniqBy`), use-debounce, date-fns/dayjs, zod, clsx/cn. Use them; never hand-roll debounce, uniqBy, once, memoize, date parsing.
- **Logger** — use it, not `console`.

## 1. Short, flat functions — read top to bottom

Every entry function (route handler, page, reducer, hook, event handler) reads like a short story of named steps. Model: Next.js `proxy.ts`:

```ts
export async function POST(req: NextRequest) {
  const denied = (await accessError()) ?? setupError();
  if (denied) return denied;

  const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, ERROR.UNREADABLE);

  return sizeError(parsed.data) ?? streamReply(parsed.data, req.signal);
}
```

- **Entry only orchestrates**; details live in small named helpers.
- **One early return per case**, no `else`, nesting ≤ 2.
- **Happy path last.**
- **Name each step** as a question (`isPublicRoute`, `hasAccess`) or an action (`redirectToLogin`, `streamReply`).
- **Catch one known error, rethrow the rest.**
- **Handler maps over switch:** `const HANDLERS = { [Type.A]: handleA, ... }`, one line each. Handlers that do almost the same thing become one factory (`markChanges(status, matcher)`).
- **Functions ≤ ~20 lines (30 is the lint limit), components ≤ ~150, files ≤ ~200.** Split bigger ones.
- **Max 3 parameters.** More than that → pass one object: `make({ name, size, color, owner })`.
- **Messages and magic values are typed consts** (`const ERROR = {...} as const`), not inline strings.

## 2. Co-location folder layout

Code lives next to the route that uses it. Promote it to a shared folder only when a second route needs it. If the project uses `eslint-config-next-clean`, this layout is enforced by lint; otherwise follow the project's existing layout.

```
src/
  app/(group)/orders/
    page.tsx              route files only: page, layout, loading, error, route…
    _components/          OrderTable.tsx — this route and its child routes only
    _hooks/               useOrders.ts
    _actions/             createOrder.ts
    _utils/               orderTotal.ts (+ orderTotal.test.ts beside it)
    _types.ts             or _types/ when one file is not enough
    [id]/page.tsx         may use ../_components (parent route)
  components/ui/          design system: Button, Input
  components/<group>/     shared components
  features/<name>/        optional: a big domain many routes use (components/, hooks/, utils/, api/)
  hooks/  lib/  types/    shared by 2+ routes (lib/utils.ts for cn() is fine)
  stores/  providers/     optional: global state, context providers
```

- Never import another route's `_folders`. Needed by two routes → move it to `components/`, `hooks/` or `lib/`, then **replace every existing copy**.
- Imports go down only: route → components/hooks/lib/types; components/ui → lib/types; lib → lib/types.
- A feature never imports another feature; combine them in the route.
- No barrel `index.ts` re-exports; import from the defining file.
- `'use client'` files never import server code (`next/headers`, `fs`, `server-only`) and read only `NEXT_PUBLIC_` env. A file reading a secret env var starts with `import 'server-only'`.
- No `misc.ts`, `helpers.ts`, `common.ts` grab bags. One file = one job, and the file name says the job.
- Folders outside `app/` are kebab-case (`components/my-widgets/`). Hooks are named `useX` (`useOrders.ts`).
- One-liner used twice stays inline. No helper for two uses.

## 3. Naming — "would a newcomer know what this is from the name alone?"

| Rule | Bad → Good |
|---|---|
| Say what it is, not where it came from | `Draft` → `ConfigurationPayload`, `backendData` → `referenceLoaders` |
| Verb matches the action: `get*` fetches now, `create*`/`build*` makes, `read*` parses, `to*` converts, `is*/has*` returns boolean | `backendReferenceData()` → `createReferenceLoaders()` |
| Pairs show the pair | `original`/`draft` → `originalConfiguration`/`draftConfiguration` |
| Throws? Say so | `possibleValue` → `requireAllowedValue`, `defined` → `expectDefined` |
| No vague words | `data`, `info`, `item`, `show`, `copy`, `next`, `take`, `build`, `review`, `store` alone |
| Zod schema `XSchema`, inferred type `X` | `CriteriaInput` (schema) → `CriteriaInputSchema` |
| Class-string consts end `_CLASSES` | `ITEM` → `ITEM_CLASSES` |
| Booleans read as questions | `loading` → `isLoading` |
| File name = main export | `screenCopy.ts` holding suggestions → `promptSuggestions.ts` |

## 4. Functional style

- `const` only; no `let`, no loops — `map`/`filter`/`reduce`/`some`/`find`.
- Never change in place: `[...list, x]`, `toSorted`, `{ ...item, field }`, `const { key, ...rest } = item`. `ref.current` is the only exception.
- No classes except custom `Error` types; a module of functions instead.
- Pure core, effects at the edges: API calls, storage and logging live in thin outer functions; the logic between them takes input and returns output.
- Expected failures are values (`{ ok: false, error }`), not `throw`.
- Unions with an exhaustive handler map or `switch`, not booleans plus flags.

## 5. TypeScript and React rules

- No `any`, no `as` casts, no `!`. Narrow with zod or type guards.
- No comments; names explain. Prettier formatting.
- `type Props` for component props.
- Conditional classes: `cn('base', { 'bg-x': isActive })` or a variant map `STYLES[variant]` — never nested ternaries in `className`.
- Effects: one job per `useEffect`; extract to a named hook (`useSaveOnLeave`).
- Derived values computed, not stored in state.

## 6. Cleaning an existing folder

When asked to clean/refactor/make readable: cover **every file in the folder**, in separate passes, and never claim more than you checked.

1. **Structure** — one job per file, co-location, import direction.
2. **Duplicates** — same logic twice in the folder or the app → one helper.
3. **Reuse** — raw HTML controls → UI kit; hand-rolled helpers → installed libraries.
4. **Naming** — list every file, function, type, const and field with a verdict against §3. This is its own pass, not part of 1–3.
5. **After a regex rename** — search string literals for the new names; renames break prompt and UI text.
6. **Verify** — tsc, lint, Prettier, tests; report the numbers.

## 7. Done means

- ESLint and tsc pass on every edited file.
- Full tsc, lint and tests ran and passed — say the counts.
- Nothing committed unless asked; when asked: small commits split by concern, each one compiling.
