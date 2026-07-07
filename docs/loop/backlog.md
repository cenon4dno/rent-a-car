# Backlog

## Active

- [ ] [P2] Google Maps pick-up location pin — integrate Google Maps JavaScript API on the booking flow pick-up location field; replace free-text input with an interactive map picker (autocomplete search + draggable marker) that stores a precise lat/lng + formatted address; display the pinned location on the booking confirmation ticket
- [ ] [P1] Post-SSO user registration & driver's license KYC — after a User signs in via Google, Microsoft, or Facebook for the first time, redirect to a mandatory profile completion page before accessing any booking feature; require upload of driver's license front image and driver's license back image; store both images (Azure Blob or local in dev); mark the account as pending-KYC until an Admin approves; block booking attempts if KYC status is not approved
- [ ] [P2] Vehicle operating location field + search filter — add an `operatingLocation` field (city/area text + lat/lng via Google Maps autocomplete) to the Vehicle schema, vehicle creation form, and vehicle edit form; expose the field in the vehicles search API as an optional filter param; add a Location filter input to the search results page FilterSidebar so users can narrow results by where the rental operates
- [ ] [P2] Dummy user seed + dev quick login — seed a dummy customer account (e.g. name: "Juan dela Cruz", email: testuser@dev.local, password in DEV_USER_SEED_PASSWORD env var) via the Prisma seed script; add a "Login as Test User" quick-login button on the login page that is only rendered when NODE_ENV=development, so developers can sign in instantly without going through SSO
- [ ] [P2] Dummy driver seed + dev quick login — seed a dummy driver account (e.g. name: "Pedro Santos", email: testdriver@dev.local, password in DEV_DRIVER_SEED_PASSWORD env var, role: DRIVER) via the Prisma seed script; add a "Login as Test Driver" quick-login button on the login page rendered only when NODE_ENV=development
- [ ] [P2] Role-aware Navbar — hide public nav links (Browse Cars, How It Works, Partners) when the user is authenticated; for DRIVER, RENTER, and ADMIN roles replace them with role-specific dashboard links only; for authenticated customers (USER role) keep Browse Cars but hide How It Works and Partners since they are onboarding-only links
- [ ] [P2] User profile self-edit — allow each role to update their own profile from a dedicated settings/profile page: Customer (USER) can update display name, phone, and profile photo; Driver can update name, phone, profile photo, and re-upload driver's license; Renter can update company name, contact details, logo, and re-upload business documents; all roles share a change-password form; backend PATCH /users/me endpoint validates ownership so users can only edit their own record
- [ ] [P2] In-app messaging system — build a real-time messaging feature allowing any role (User, Driver, Renter, Admin) to send direct messages to each other; add a Messages menu item in the Navbar with an unread badge count; create a /messages inbox page listing all conversations sorted by latest activity; support booking-linked threads so a conversation can be scoped to a specific booking (visible from the booking detail page); backend: Message and Conversation models in Prisma, REST endpoints for listing conversations and sending/fetching messages, WebSocket (Socket.io) gateway for real-time delivery; admins can view all conversations for dispute mediation
- [ ] [P2] Home page quick-booking location with Google Maps — replace the current free-text location input in the hero SearchWidget with a Google Maps Places Autocomplete input; on selection store the place name, lat, and lng; pass the location value into the search query so results on /search are pre-filtered by that location; ensure the same Maps autocomplete is consistent with the pick-up location pin on the booking flow
- [ ] [P3] Admin-configurable homepage carousel & featured section — add a HomepageConfig model (Prisma) to store: ordered list of carousel slides (image, headline, subtext, CTA link) and a curated list of featured vehicle IDs or a featured selection rule (e.g. highest rated, manually pinned); build an /admin/homepage editor page where Admins can add/remove/reorder carousel slides with image upload and preview, and hand-pick or auto-select featured vehicles; homepage reads config from the API at render time so changes go live without a deploy
- [ ] [P2] Public legal pages — ensure all footer legal pages (/legal/[slug], e.g. Terms & Conditions, Privacy Policy, Cookie Policy) are fully accessible without authentication; remove any auth guards or middleware redirects from the /legal route segment; verify the Footer links render correctly for unauthenticated visitors and that the pages return content via a public GET /legal/:slug API endpoint requiring no JWT
- [ ] [P3] Complaints & feedback page (/feedback) — a public-facing form where any user (logged in or not) can submit a complaint or general feedback; fields: name, email, subject, category (Complaint / Feedback / Suggestion), message, and optional file attachment; backend: POST /feedback endpoint storing submissions in a Feedback model; Admin dashboard gains a Feedback inbox listing all submissions with status (New, In Review, Resolved) and the ability to reply or update status; submitter receives an email acknowledgement via the notification service
- [ ] [P3] Contact Us page (/contact) — static page with company contact details (email, phone, office address, social links) plus an inline inquiry form (name, email, message); form submissions are routed to the same backend Feedback endpoint with category set to Inquiry; page is linked in the site Footer

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
