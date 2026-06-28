# Current Plan — Iteration 1

**Goal:** Scaffold the full monorepo structure (covers P1 items 1, 2, 3)
**Started:** 2026-06-28
**Milestone commit tag:** `monorepo-scaffold`

## Acceptance Criteria

- Root `package.json` declares npm workspaces for `apps/*` and `packages/*`
- `apps/web` is a working Next.js 15 App Router app with Tailwind, ESLint, TypeScript
- `apps/api` is a working NestJS app with Prisma configured for SQLite dev DB
- `packages/shared` exports shared TypeScript types
- Husky pre-commit hook runs ESLint + Prettier on staged files
- All code committed and pushed with `Milestone: monorepo-scaffold` tag

## Steps

1. [x] Write plan and update backlog
2. [ ] Create root `package.json` (workspaces: apps/_, packages/_) + root configs (.prettierrc, .eslintrc.js, tsconfig.base.json)
3. [ ] Create `packages/shared` (package.json, tsconfig.json, src/index.ts with base types)
4. [ ] Run `create-next-app` in `apps/web` — TS, Tailwind, ESLint, App Router, no src-dir
5. [ ] Scaffold `apps/api` — NestJS structure + Prisma schema (User placeholder) + SQLite
6. [ ] Set up Husky + lint-staged at root
7. [ ] Run `npm install` at root to link all workspaces
8. [ ] Commit all files + push → Milestone: monorepo-scaffold

## Cutpoint (if rate limit hit)

Write last completed step number to session-state.md and schedule wakeup.
