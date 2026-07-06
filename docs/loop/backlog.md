# Backlog

## Active

_(none)_

## In Progress

_(none)_

## Completed

- [x] [P4] Third-party KYC verification — KycModule with Onfido + Veriff integration stubs; webhook endpoints with HMAC signature verification; KYC_PROVIDER env var switch — 2026-07-05
- [x] [P4] Footer "Created by u2i" credit — 2026-07-05
- [x] [P4] Admin CMS for legal pages — LegalPage model, CRUD endpoints, /admin/legal editor, /legal/:slug public — 2026-07-05
- [x] [P4] Meta (Facebook) SSO — NextAuth Facebook provider + login button — 2026-07-05
- [x] [P4] Configure Azure GitHub secrets to enable Deploy workflow — all secrets documented in /admin/config; deploy.yml updated with Facebook, Apple, PayMongo secrets — 2026-07-05
- [x] [P3] Maintenance schedule forecasting — 30-day use interval heuristic in fleet analytics — 2026-07-05
- [x] [P3] GMV and commission revenue tracking — Admin BI with renter acquisition and platform health — 2026-07-05
- [x] [P3] User demographic breakdowns — GET /vehicles/my/demographics; KYC breakdown, monthly new customers, repeat rate on /renter/analytics — 2026-07-05
- [x] [P3] Fleet utilization rate BI — GET /vehicles/my/analytics; utilization, top vehicles, monthly revenue — 2026-07-05
- [x] [P3] Per-tenant commission rate — Admin PATCH /admin/renters/:id/commission — 2026-07-05
- [x] [P3] SOS button — POST /bookings/:id/sos; notifies renter and all admins — 2026-07-05
- [x] [P3] Driver no-show flow — POST /bookings/:id/driver-no-show; full refund; penalty flag — 2026-07-05
- [x] [P3] Extension payment failure handling — notification stub via sendExtensionPaymentFailure — 2026-07-05
- [x] [P3] Late return penalty charges — POST /bookings/:id/late-return; 1.5x daily rate; notifications — 2026-07-05
- [x] [P3] Driver public profile page — /driver/[id] — 2026-07-05
- [x] [P3] Customer profile page — /customer/[id] visible to Renters and Admins — 2026-07-05
- [x] [P3] Chauffeur add-on booking flow — backend assignDriver endpoint + renter bookings UI — 2026-07-05
- [x] [P3] GCash / Maya e-wallet payments — PayMongo Sources API — 2026-07-05
- [x] [P3] Map integration on booking confirmation — OpenStreetMap iframe — 2026-07-05
- [x] [P3] QR code on booking confirmation ticket — 2026-07-05
- [x] [P3] Car comparison feature — useCompare hook, CompareButton on VehicleCard, ComparisonTray, /compare page — 2026-07-05
- [x] [P3] Redesign the application use tailwind template in tailawesome called Landwind — dark hero with blobs, stats band, 6-feature grid, redesigned steps and CTAs — 2026-07-05
- [x] [P2] Car use-case tagging system — tags in Vehicle schema; FilterSidebar picker; VehicleForm selector; search DTO tag param — 2026-07-05
- [x] [P2] Notification system — Nodemailer with SMTP fallback; booking confirmation, cancellation, SOS, late return, driver no-show — 2026-07-05
- [x] [P2] Cancellation/Refund SLA automation — 100%/50%/0% refund in cancel() based on hoursUntilPickup — 2026-07-05
- [x] [P2] Two-way review system — Review (customer→vehicle), RenterReview (renter→customer), ReviewForm + RenterReviewInline — 2026-07-05
- [x] [P2] Driver user group — DriversModule, public/private profiles, Renter registers drivers, KYC upload — 2026-07-05
- [x] [P2] Homepage featured-car carousel — FeaturedCarousel with autoplay, prev/next, dot pagination — 2026-07-05
- [x] [P2] Persistent site footer — ensure the Footer component renders on every page via the shared root layout, matching the header's persistence behaviour — 2026-06-30
- [x] [P2] Persistent site header — wrap all pages in a shared layout that renders the Navbar so it persists across navigation without re-mounting; ensure auth state, active route highlight, and responsive menu are consistent on every route — 2026-06-30
- [x] [P2] Renter public profile page (`/renter/[id]`) — company contact details, fleet list, average ratings, Trust Badge; publicly accessible without login — 2026-06-29
- [x] [P2] Add email/password login field to the login page alongside SSO buttons — seed default admin account (email: cenon4dno@gmail.com, password stored in ADMIN_SEED_PASSWORD env var); backend: POST /auth/login with bcrypt password validation; web: CredentialsProvider in NextAuth config — 2026-06-29
- [x] [P4] npm audit fix pass — 48 remaining in Expo SDK transitive deps only, unblockable without major Expo upgrade — 2026-06-29
- [x] [P4] Dispute resolution and ticket system — 2026-06-29
- [x] [P4] AI Chatbot with RAG pipeline and MCP integration — 2026-06-29
- [x] [P4] Mobile: Microsoft/Apple SSO — 2026-06-29
- [x] [P3] Fix GitHub Actions CI — prisma generate, shared build, TS errors — 2026-06-29
- [x] [P4] Mobile: camera-based KYC document upload (expo-image-picker) — 2026-06-29
- [x] [P4] React Native (Expo) mobile app — mirror web booking flow — 2026-06-29
- [x] [P3] Replace disk-based KYC upload with Azure Blob Storage adapter (uploads lost on App Service restart) — 2026-06-29
- [x] [P4] GitHub Actions CI/CD pipeline + Azure App Service deployment config — 2026-06-29
- [x] [P3] Embed PayMongo.js card payment widget (Payment Intents API + CardPaymentForm) — 2026-06-29
- [x] [P3] Add active route highlighting to Renter and Admin sub-navs — 2026-06-29
- [x] [P3] Integrate PayMongo/Stripe + webhook handler for real payment confirmation — 2026-06-28
- [x] [P3] Add add-ons support to CreateBookingDto + BookingsService (backend total alignment) — 2026-06-28
- [x] [P2] Implement KYC document upload flow (User, Renter, Driver) — 2026-06-28
- [x] [P3] Build Admin Dashboard: user management, platform BI, commission config — 2026-06-28
- [x] [P3] Build Renter Dashboard: fleet CRUD, booking management, revenue BI stats — 2026-06-28
- [x] [P3] Build My Bookings page (`/bookings`) with status badges — 2026-06-28
- [x] [P3] Build booking review + confirm+pay stub + confirmation ticket pages — 2026-06-28
- [x] [P3] Build vehicle detail page (`/vehicle/[id]`) with live booking form — 2026-06-28
- [x] [P3] Build vehicle search and results page (`/search`) with filters sidebar + grid — 2026-06-28
- [x] [P3] Fix BookingsService status-as-any with BookingStatus enum — 2026-06-28
- [x] [P3] lib/api.ts typed fetch helpers — 2026-06-28
- [x] [P3] Layout components: Navbar (auth-aware, responsive), Footer — 2026-06-28
- [x] [P3] Shared UI atoms: Button, Badge, VehicleCard, PartnerCard, SearchWidget — 2026-06-28
- [x] [P3] Build home page: hero, how-it-works, featured vehicles, top partners, CTA — 2026-06-28
- [x] [P2] RolesGuard + @Roles() decorator — 2026-06-28
- [x] [P2] Scaffold NestJS ReviewsModule (post review, avg rating by vehicle/renter) — 2026-06-28
- [x] [P2] Scaffold NestJS PaymentsModule (create, confirm, refund stubs) — 2026-06-28
- [x] [P2] Scaffold NestJS BookingsModule (create w/ Prisma tx concurrency, confirm/cancel/complete) — 2026-06-28
- [x] [P2] Scaffold NestJS VehiclesModule (search, CRUD, availability filter) — 2026-06-28
- [x] [P2] Scaffold NestJS UsersModule (upsertFromSso, findById, findByEmail) — 2026-06-28
- [x] [P2] Scaffold NestJS AuthModule (JWT strategy, JwtAuthGuard, /auth/sso, /auth/me) — 2026-06-28
- [x] [P2] Set up NextAuth.js v5 with Google, Microsoft Entra ID, Apple SSO + JWT sessions — 2026-06-28
- [x] [P1] Replace `apps/web/CLAUDE.md` and `apps/web/AGENTS.md` boilerplate — 2026-06-28
- [x] [P1] Add `.gitattributes` to enforce LF line endings — 2026-06-28
- [x] [P1] Initialize NestJS API with Prisma ORM + SQLite dev DB + initial migration — 2026-06-28
- [x] [P1] Initialize Next.js 15 web app (App Router, Tailwind, ESLint, TypeScript) — 2026-06-28
- [x] [P1] Scaffold monorepo structure — root npm workspaces, `apps/*`, `packages/*` — 2026-06-28
