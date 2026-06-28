# Backlog

## Active

- [ ] [P1] Add `.gitattributes` to enforce LF line endings (suppresses Windows CRLF warnings)
- [ ] [P1] Replace `apps/web/CLAUDE.md` and `apps/web/AGENTS.md` boilerplate with project-specific content
- [ ] [P2] Set up NextAuth.js with Google, Microsoft, Apple SSO providers and JWT session strategy
- [ ] [P2] Implement KYC document upload flow (User, Renter, Driver) with file storage abstraction
- [ ] [P2] Scaffold NestJS feature modules: auth, users, vehicles, bookings, payments, reviews
- [ ] [P3] Build home page: hero search widget, featured vehicles section, top partners carousel
- [ ] [P3] Build vehicle search and results page with filters
- [ ] [P3] Build booking flow: selection → review → payment → confirmation pages
- [ ] [P3] Integrate PayMongo/Stripe for payment processing
- [ ] [P3] Admin dashboard: user management, platform BI, commission config
- [ ] [P3] Renter dashboard: fleet management, booking management, revenue BI
- [ ] [P4] React Native (Expo) mobile app — mirror web booking flow
- [ ] [P4] AI Chatbot with RAG pipeline and MCP integration
- [ ] [P4] Dispute resolution and ticket system
- [ ] [P4] Azure App Service deployment + Nginx reverse proxy + GitHub Actions CI/CD
- [ ] [P4] npm audit fix pass — address 26 vulnerabilities flagged during scaffold

## In Progress

_(none)_

## Completed

- [x] [P1] Scaffold monorepo structure — root npm workspaces, `apps/*`, `packages/*` — 2026-06-28
- [x] [P1] Initialize Next.js 15 web app (App Router, Tailwind, ESLint, TypeScript) — 2026-06-28
- [x] [P1] Initialize NestJS API with Prisma ORM + SQLite dev DB + initial migration — 2026-06-28
