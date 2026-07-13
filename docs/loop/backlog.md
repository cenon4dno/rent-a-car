# Backlog

## Active

- [ ] [P2] In-app messaging system — build a real-time messaging feature allowing any role (User, Driver, Renter, Admin) to send direct messages to each other; add a Messages menu item in the Navbar with an unread badge count; create a /messages inbox page listing all conversations sorted by latest activity; support booking-linked threads so a conversation can be scoped to a specific booking (visible from the booking detail page); backend: Message and Conversation models in Prisma, REST endpoints for listing conversations and sending/fetching messages, WebSocket (Socket.io) gateway for real-time delivery; admins can view all conversations for dispute mediation
- [ ] [P3] Admin-configurable homepage carousel & featured section — add a HomepageConfig model (Prisma) to store: ordered list of carousel slides (image, headline, subtext, CTA link) and a curated list of featured vehicle IDs or a featured selection rule (e.g. highest rated, manually pinned); build an /admin/homepage editor page where Admins can add/remove/reorder carousel slides with image upload and preview, and hand-pick or auto-select featured vehicles; homepage reads config from the API at render time so changes go live without a deploy
- [ ] [P3] Complaints & feedback page (/feedback) — a public-facing form where any user (logged in or not) can submit a complaint or general feedback; fields: name, email, subject, category (Complaint / Feedback / Suggestion), message, and optional file attachment; backend: POST /feedback endpoint storing submissions in a Feedback model; Admin dashboard gains a Feedback inbox listing all submissions with status (New, In Review, Resolved) and the ability to reply or update status; submitter receives an email acknowledgement via the notification service
- [ ] [P3] Build /how-it-works and /partners pages — both are linked from the Navbar (unauthenticated) and Footer but currently 404; /how-it-works: static 3-step guide matching the homepage section; /partners: grid of verified renters reusing the top-partners API
- [ ] [P3] Driver dashboard — private view for DRIVER role showing upcoming schedule (assigned bookings), currently assigned vehicle, completed trip count, and earnings summary; add a /driver/dashboard page guarded to DRIVER role and link it from the role-aware Navbar (replacing the placeholder My Profile link)
- [ ] [P3] Contact Us page (/contact) — static page with company contact details (email, phone, office address, social links) plus an inline inquiry form (name, email, message); form submissions are routed to the same backend Feedback endpoint with category set to Inquiry; page is linked in the site Footer

## In Progress

_(none)_

## Completed

- [x] [P2] Google Maps pick-up location pin — new MapLocationPicker (autocomplete + draggable marker with reverse geocoding, text-only fallback without key); BookingForm stores pickup address + lat/lng, threaded through /booking/review into createBooking; Booking gains pickupLat/pickupLng (migration 20260713004857); confirmation ticket OSM map centers on the exact pin when coords exist — 2026-07-13
- [x] [P2] Vehicle operating location field + search filter — operatingLat/operatingLng added to Vehicle (migration 20260713004410); create/update DTOs + VehicleForm gain an Operating Location autocomplete field; search() filters operatingLocation by the leading city token of the location param; FilterSidebar gains a Location filter; lat/lng accepted by search DTO (reserved for ranking) — 2026-07-13
- [x] [P2] Home page quick-booking location with Google Maps — new shared lib/googleMaps.ts loader + LocationAutocomplete component (Places Autocomplete, plain-text fallback when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY unset); hero SearchWidget stores address + lat/lng and passes location/lat/lng into /search query — 2026-07-13
- [x] [P2] Profile page for every user type with integrated KYC — KYC section (#kyc anchor) embedded in /profile with role-aware docs (Customer: license front/back + secondary ID; Renter: permit + registration; Driver: professional license + NEW backgroundCheck doc type; Admin: settings only); /profile/kyc now redirects to /profile#kyc; Navbar KYC links updated for all non-admin roles — 2026-07-13

- [x] [P2] Public legal pages — middleware PUBLIC_PATHS now includes /legal (plus /compare, /renter, /driver, /how-it-works, /partners); GET /legal/:slug API was already unguarded; dashboards under /renter keep their own server-side layout guards — 2026-07-12
- [x] [P2] Role-aware Navbar — navLinksForRole(): unauthenticated keeps all public links; customers keep Browse Cars only; ADMIN/RENTER get dashboard links; DRIVER gets My Profile; My Bookings/KYC shown per role; desktop + mobile menus — 2026-07-12
- [x] [P2] Dummy driver seed + dev quick login — Pedro Santos (testdriver@dev.local, DRIVER under Metro, VERIFIED, DEV_DRIVER_SEED_PASSWORD) in seed.ts; "Login as Test Driver" one-click button in the dev-only login panel — 2026-07-12
- [x] [P2] Dummy user seed + dev quick login — Juan dela Cruz (testuser@dev.local, VERIFIED, DEV_USER_SEED_PASSWORD) in seed.ts; "Login as Test User" one-click credentials sign-in on the login page; entire dev panel now gated to NODE_ENV=development — 2026-07-12
- [x] [P1] Post-SSO user registration & driver's license KYC — /onboarding page (license front/back upload, pending-approval state); profileComplete in session JWT + middleware gate on /booking*; live KYC re-check on /booking/review; backend blocks booking create unless kycStatus VERIFIED; CustomerProfile auto-created on SSO signup — 2026-07-12
- [x] [P1] User profile self-edit — /profile settings page (role-aware fields, avatar/logo upload, document re-upload, change-password); PATCH /users/me + /users/me/password — 2026-07-12
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
