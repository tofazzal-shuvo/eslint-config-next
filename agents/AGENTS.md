# Frontend rules for AI agents

This project is linted by `eslint-config-next-clean`. Write code that passes it the first time.

## Before you finish any change

1. Run `npx eslint <files you changed>` and fix every error. Each message says what to write instead.
2. Run `npx tsc --noEmit`.
3. Never silence a rule with `eslint-disable`, `any`, `as` or `!`. Fix the code.

## Where files go

Code lives next to the route that uses it. Move it to a shared folder only when a second route needs it.

```
src/app/(group)/orders/
  page.tsx          route files only
  _components/      this route and its child routes
  _hooks/  _actions/  _utils/  _types.ts
src/components/ui/  design system
src/components/<group>/  hooks/  lib/  types/   shared by 2+ routes
src/features/<name>/     a big domain many routes use
```

- Never import another route's `_folders`, another feature, or a `page.tsx`.
- No barrel `index.ts` re-exports. No `helpers.ts`, `misc.ts`, `common.ts`.
- A `'use client'` file never imports server code and reads only `NEXT_PUBLIC_` env.

## How code reads

- Short, flat functions: early returns, no `else` after `return`, nesting 2 deep at most, about 20 lines.
- At most 3 parameters; pass one object for more.
- `const` only. No loops, no mutation, no classes: use `map`, `filter`, `reduce`, spread.
- Names a newcomer understands: no `data`, `info`, `item`; booleans start with `is` or `has`; hooks are `useX`.
- Use the project's UI kit: no raw `<button>` or `<input>` outside `components/ui`.
- Conditional classes go through `cn()`, never template strings.

## What lint cannot check, so you must

- Search for an existing helper before writing a new one.
- Expected failures are returned as values (`{ ok: false, error }`), not thrown.
- Keep API calls, storage and logging in thin outer functions; keep the logic between them pure.

Full rules with bad and good examples: `node_modules/eslint-config-next-clean/README.md`.
