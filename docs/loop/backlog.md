# Backlog

## Active

- [x] [P2] Implement KYC document upload flow (User, Renter, Driver) — 2026-06-28
- [x] [P3] Add add-ons support to CreateBookingDto + BookingsService (backend total alignment) — 2026-06-28
- [ ] [P3] Integrate PayMongo/Stripe + webhook handler for real payment confirmation
- [ ] [P4] GitHub Actions CI/CD pipeline + Azure App Service deployment config
- [ ] [P4] React Native (Expo) mobile app — mirror web booking flow
- [ ] [P4] AI Chatbot with RAG pipeline and MCP integration
- [ ] [P4] Dispute resolution and ticket system
- [ ] [P4] npm audit fix pass — address 26 vulnerabilities flagged during scaffold
- [ ] [P3] Add active route highlighting to Renter and Admin sub-navs (minor UX)

## In Progress

_(none)_

## Completed

- [x] [P1] Scaffold monorepo structure — root npm workspaces, `apps/*`, `packages/*` — 2026-06-28
- [x] [P1] Initialize Next.js 15 web app (App Router, Tailwind, ESLint, TypeScript) — 2026-06-28
- [x] [P1] Initialize NestJS API with Prisma ORM + SQLite dev DB + initial migration — 2026-06-28
- [x] [P1] Add `.gitattributes` to enforce LF line endings — 2026-06-28
- [x] [P1] Replace `apps/web/CLAUDE.md` and `apps/web/AGENTS.md` boilerplate — 2026-06-28
- [x] [P2] Set up NextAuth.js v5 with Google, Microsoft Entra ID, Apple SSO + JWT sessions — 2026-06-28
- [x] [P2] Scaffold NestJS AuthModule (JWT strategy, JwtAuthGuard, /auth/sso, /auth/me) — 2026-06-28
- [x] [P2] Scaffold NestJS UsersModule (upsertFromSso, findById, findByEmail) — 2026-06-28
- [x] [P2] Scaffold NestJS VehiclesModule (search, CRUD, availability filter) — 2026-06-28
- [x] [P2] Scaffold NestJS BookingsModule (create w/ Prisma tx concurrency, confirm/cancel/complete) — 2026-06-28
- [x] [P2] Scaffold NestJS PaymentsModule (create, confirm, refund stubs) — 2026-06-28
- [x] [P2] Scaffold NestJS ReviewsModule (post review, avg rating by vehicle/renter) — 2026-06-28
- [x] [P2] RolesGuard + @Roles() decorator — 2026-06-28
- [x] [P3] Build home page: hero, how-it-works, featured vehicles, top partners, CTA — 2026-06-28
- [x] [P3] Shared UI atoms: Button, Badge, VehicleCard, PartnerCard, SearchWidget — 2026-06-28
- [x] [P3] Layout components: Navbar (auth-aware, responsive), Footer — 2026-06-28
- [x] [P3] lib/api.ts typed fetch helpers — 2026-06-28
- [x] [P3] Fix BookingsService status-as-any with BookingStatus enum — 2026-06-28
- [x] [P3] Build vehicle search and results page (`/search`) with filters sidebar + grid — 2026-06-28
- [x] [P3] Build vehicle detail page (`/vehicle/[id]`) with live booking form — 2026-06-28
- [x] [P3] Build booking review + confirm+pay stub + confirmation ticket pages — 2026-06-28
- [x] [P3] Build My Bookings page (`/bookings`) with status badges — 2026-06-28
- [x] [P3] Build Renter Dashboard: fleet CRUD, booking management, revenue BI stats — 2026-06-28
- [x] [P3] Build Admin Dashboard: user management, platform BI, commission config — 2026-06-28
