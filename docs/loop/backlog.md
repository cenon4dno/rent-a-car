# Backlog

## Active

- [ ] [P2] Add email/password login field to the login page alongside SSO buttons — seed default admin account (email: cenon4dno@gmail.com, password stored in ADMIN_SEED_PASSWORD env var); backend: POST /auth/login with bcrypt password validation; web: CredentialsProvider in NextAuth config
- [ ] [P2] Driver user group — NestJS DriversModule, driver profiles (public/private), Renter registers drivers, driver schedule, professional license KYC upload, background check clearance field
- [ ] [P2] Two-way review system — User reviews Car/Driver/Renter post-trip; Renter reviews User; wire into ReviewsModule and display on profiles
- [ ] [P2] Cancellation/Refund SLA automation — 100% refund if cancelled ≥48h before pickup, 50% if <48h, 0% if <24h; automated refund routing back to original payment method
- [ ] [P2] Notification system — email/push notifications for booking confirmation, cancellation, late return alerts, payment failure, dispute updates, driver no-show
- [ ] [P2] Renter public profile page (`/renter/[id]`) — company contact details, fleet list, average ratings, reviews, Trust Badge (Verified / Undergoing Validation / Not Verified)
- [ ] [P3] Car comparison feature — users can select up to 3 cars from search results and compare side-by-side (specs, pricing, ratings, add-ons, mileage limits, fuel type, transmission, seating capacity)
- [ ] [P3] QR code on booking confirmation ticket — generate and display QR code with booking reference number on the Booked confirmation page
- [ ] [P3] Map integration on booking confirmation — embed map showing exact pickup location on the Booked page and vehicle detail page
- [ ] [P3] GCash / Maya e-wallet payments — PayMongo Sources API integration for local Philippine e-wallets alongside existing card payment
- [ ] [P3] Chauffeur add-on booking flow — when chauffeur add-on is selected, allow Renter to assign a registered driver to the booking; show driver details on confirmation ticket
- [ ] [P3] Customer profile page — visible only to Renters (on booking request), assigned Drivers, and Admins; shows rental history, verified ID status, user ratings
- [ ] [P3] Driver public profile page — name, photo, number of completed trips, average ratings, and reviews
- [ ] [P3] Late return penalty charges — automated charge to user's card on file; instant alert to Renter; suggest alternative vehicle from fleet for next affected booking
- [ ] [P3] Extension payment failure handling — deny extension immediately; notify user to update payment method within 1 hour; mandate immediate return if unpaid
- [ ] [P3] Driver no-show flow — user reports via app; automated full refund; high-severity penalty flag applied to Renter's profile
- [ ] [P3] SOS button — in-app vehicle breakdown button; notifies Renter and Admin; pauses rental timer
- [ ] [P3] Per-tenant commission rate — allow Admin to set a per-renter commission override on top of the global 5% default
- [ ] [P3] Fleet utilization rate BI — percentage utilization per vehicle in Renter dashboard; most profitable vehicles ranking
- [ ] [P3] User demographic breakdowns — renter-facing BI showing demographic data of customers who booked their fleet
- [ ] [P3] GMV and commission revenue tracking — Admin BI panel showing gross merchandise value, platform commission earned, and revenue trend charts
- [ ] [P3] Maintenance schedule forecasting — Renter BI feature predicting maintenance needs based on mileage and booking frequency
- [ ] [P4] Configure Azure GitHub secrets to enable Deploy workflow (DATABASE_URL, publish profiles)
- [ ] [P4] Meta (Facebook) SSO — add Meta provider to NextAuth alongside Google, Microsoft, Apple
- [ ] [P4] Admin CMS for legal pages — dynamic Legal, T&C, and Contact Us pages manageable via Admin dashboard
- [ ] [P4] Third-party KYC verification — integrate Onfido or Veriff API for automated document verification before allowing bookings; currently manual admin approval only

- [x] [P2] Implement KYC document upload flow (User, Renter, Driver) — 2026-06-28
- [x] [P3] Add add-ons support to CreateBookingDto + BookingsService (backend total alignment) — 2026-06-28
- [x] [P3] Integrate PayMongo/Stripe + webhook handler for real payment confirmation — 2026-06-28
- [x] [P3] Embed PayMongo.js card payment widget (Payment Intents API + CardPaymentForm) — 2026-06-29
- [x] [P4] GitHub Actions CI/CD pipeline + Azure App Service deployment config — 2026-06-29
- [x] [P3] Replace disk-based KYC upload with Azure Blob Storage adapter (uploads lost on App Service restart) — 2026-06-29
- [x] [P4] React Native (Expo) mobile app — mirror web booking flow — 2026-06-29
- [x] [P4] Mobile: camera-based KYC document upload (expo-image-picker) — 2026-06-29
- [x] [P3] Fix GitHub Actions CI — prisma generate, shared build, TS errors — 2026-06-29
- [x] [P4] Mobile: Microsoft/Apple SSO — 2026-06-29
- [x] [P4] AI Chatbot with RAG pipeline and MCP integration — 2026-06-29
- [x] [P4] Dispute resolution and ticket system — 2026-06-29
- [x] [P4] npm audit fix pass — 48 remaining in Expo SDK transitive deps only, unblockable without major Expo upgrade — 2026-06-29
- [x] [P3] Add active route highlighting to Renter and Admin sub-navs — 2026-06-29

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
