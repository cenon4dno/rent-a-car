# Current Plan — Iteration 2

**Goal:** Authentication foundation — covers P1 cleanup + P2 auth items
**Started:** 2026-06-28
**Milestone commit tag:** `auth`

## Acceptance Criteria

- `.gitattributes` enforces LF line endings — no more CRLF warnings on Windows
- `apps/web/CLAUDE.md` and `apps/web/AGENTS.md` replaced with project-specific content
- NextAuth.js configured in `apps/web` with Google, Microsoft, Apple providers + JWT sessions
- Login page at `/login` with SSO buttons
- `SessionProvider` wraps app layout
- NestJS `AuthModule` with JWT strategy, `JwtAuthGuard`, `/auth/login` and `/auth/me` endpoints

## Steps

1. [x] Write plan
2. [ ] Add `.gitattributes` + add `.claude/` to root `.gitignore`
3. [ ] Replace `apps/web/CLAUDE.md` and `apps/web/AGENTS.md`
4. [ ] `npm install next-auth@beta` in `apps/web` + `@auth/prisma-adapter` in `apps/api`
5. [ ] Create `apps/web/auth.ts` (NextAuth config with Google/Microsoft/Apple)
6. [ ] Create `apps/web/app/api/auth/[...nextauth]/route.ts`
7. [ ] Wrap `apps/web/app/layout.tsx` with `SessionProvider`
8. [ ] Create `apps/web/app/login/page.tsx` with SSO buttons
9. [ ] Scaffold `apps/api/src/auth/` — module, service, controller, JWT strategy, guard
10. [ ] Commit + push → Milestone: auth

## Cutpoint

Write last completed step to session-state.md and schedule wakeup.
