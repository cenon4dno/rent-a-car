# Observations Log

## 2026-06-29 — Iteration 18 (Email/Password Login + Home Page Live API)

**Goal:** Add email/password login alongside SSO; seed admin account; wire home page to live API data
**Outcome:** Done (commits 43439b2, 44e4be6)
**Findings:**

- `passwordHash String?` already existed on the Prisma `User` model — no migration needed for credentials login.
- `bcryptjs` was already installed in the API (used by `seed.ts`) — imported directly in `AuthService`.
- NextAuth v5 credentials flow: `authorize()` calls `POST /auth/login` and returns `{ id, role, apiToken }`. JWT callback branches on `account.provider === 'credentials'` to skip the SSO exchange and copy fields directly.
- Admin user (`cenon4dno@gmail.com`) added to `seed.ts` using `ADMIN_SEED_PASSWORD` env var (falls back to `'changeme'` in dev). Re-seeded on every `db:seed` run since `deleteMany()` wipes all users.
- Home page was wired to live API (`searchVehicles`, `getTopRenters`) from static placeholder data. `VehicleImage.tsx` component added to handle image loading with fallback.
- `seed-clean.ts` utility script added (`db:seed-clean` script) for resetting DB without re-seeding.

**Next Actions:**

- Driver user group — DriversModule, driver profiles, renter registers drivers, professional license KYC
- Two-way review system — post-trip reviews wired to ReviewsModule and profiles
- Renter public profile page `/renter/[id]`

## 2026-06-29 — Iteration 17 (Mobile SSO + Missing Package Fixes)

**Goal:** Add Microsoft and Apple SSO to mobile app; add missing expo packages to package.json
**Outcome:** Done — Milestone: mobile-sso (commit 26621ff)
**Findings:**

- `expo-image-picker` was used in `kyc.tsx` but was never added to `apps/mobile/package.json`. Added along with `expo-apple-authentication`.
- Microsoft SSO uses `useAutoDiscovery` from `expo-auth-session` pointed at the Azure AD v2.0 OIDC endpoint, then calls `graph.microsoft.com/v1.0/me` for user info.
- Apple Sign In uses `expo-apple-authentication` native iOS SDK. Apple only returns `email` on the first sign-in — subsequent logins use a private relay address. Handled by falling back to `${user}@privaterelay.appleid.com`.
- Apple Sign In button is conditionally rendered (`Platform.OS === 'ios'`) since it's iOS-only.
- `ERR_REQUEST_CANCELED` from Apple auth is not an error — it means user cancelled. Must check this code before showing an alert.
- All P1–P4 backlog items are now complete. Only deployment configuration (Azure secrets) remains as a user-action item.

**Next Actions:**

- Configure GitHub Actions secrets for Azure deployment (user action required — cannot be automated)

## 2026-06-29 — Iteration 16 (CI Stabilization)

**Goal:** Get GitHub Actions CI passing on main branch after multiple cascading failures
**Outcome:** Done — CI (lint/build/test) now green; Deploy blocked on missing Azure secrets (expected)
**Findings:**

- `npm ci --ignore-scripts` skips Prisma postinstall generation — must run `prisma generate` as an explicit CI step before any TypeScript builds
- `@rent-a-car/shared` dist is gitignored; CI must build it before web app since Next.js type checking needs `dist/index.d.ts`
- Prisma `groupBy` inside `$transaction([])` causes TS2615 circular type reference — use `Promise.all` instead
- `as const` on Prisma `notIn` arrays creates readonly tuple that isn't assignable to `BookingStatus[]` — use the `BookingStatus` enum value directly
- NextAuth v5 beta `MicrosoftEntraId` provider no longer accepts `tenantId` directly — configure via `issuer` URL: `https://login.microsoftonline.com/${tenantId}/v2.0`
- Deploy workflow fails without `DATABASE_URL` GitHub secret — this is expected until Azure is provisioned

**Next Actions:**

- Add Azure GitHub secrets to enable Deploy workflow (low priority — app not yet deployed)
- Mobile: Microsoft/Apple SSO (P4, optional)

## 2026-06-29 — Iteration 15 (Card Payments + Mobile KYC + npm Cleanup)

**Goal:** PayMongo card payment widget, mobile expo-image-picker KYC, npm audit fix pass
**Outcome:** Done — Milestone: payments-mobile-cleanup (commit c140ff8)
**Findings:**

- PayMongo card payments use the Payment Intents API (3 steps: create intent → tokenize card → attach method). This is separate from the Sources API used for GCash/Maya. Card details are passed from frontend → backend → PayMongo for this demo; production would use PayMongo.js for client-side tokenization.
- `CardPaymentForm` uses controlled inputs with real-time formatting (card number groups, MM/YY expiry) and validates all fields before enabling the Confirm button via `onCardDetails(null)` when incomplete.
- `react@18.3.2` in mobile package.json was a typo — that version doesn't exist on npm (latest React 18 is `18.3.1`). Changed to `^18.3.1`. This was blocking ALL workspace installs.
- Root `.npmrc` with `legacy-peer-deps=true` added to allow expo-image-picker to resolve peer deps without strict version checking.
- `expo-image-picker` installed successfully once the react version was fixed. Provides `launchImageLibraryAsync` and `launchCameraAsync` with permissions handling.
- Mobile KYC screen (`/profile/kyc`) supports both camera capture and library picker. Upload uses `FormData` with the `{ uri, name, type }` react-native format.
- npm audit: 48 vulnerabilities remain (all in Expo SDK transitive deps — expo-splash-screen, @expo/prebuild-config). Cannot be fixed without major Expo SDK version upgrade. Documented; acceptable for dev.

**Next Actions:** (no new critical P1-P3 items remain)

- Consider running `prisma migrate deploy` + seeding KB on CI/CD deploy step
- Add ANTHROPIC_API_KEY to deployment env vars for chatbot
- Add AZURE_STORAGE_ACCOUNT + AZURE_STORAGE_SAS_TOKEN + AZURE_STORAGE_CONTAINER to deployment env

---

## 2026-06-29 — Iteration 14 (AI Chatbot with RAG Pipeline)

**Goal:** AI Chatbot with RAG pipeline — booking status, car availability, rental policy Q&A
**Outcome:** Done — Milestone: ai-chatbot (commit 700f6ae)
**Findings:**

- `KnowledgeBase` Prisma model stores category, question, answer, and keywords for each entry. 19 FAQ entries seeded covering booking, payment, KYC, vehicles, disputes, and account topics.
- RAG pipeline uses keyword-based scoring (tokenize query → score against KB entry text+keywords → top-4 entries) rather than vector embeddings — no extra infra needed. Accuracy is acceptable for structured FAQ content.
- `ChatModule` has two endpoints: `POST /chat` (public, no auth) and `POST /chat/auth` (JwtAuthGuard, injects personalized user context — active booking, KYC status — into the prompt).
- Claude API call uses `claude-haiku-4-5-20251001` with a system prompt that injects KB context. Model ID must be exact — using the wrong format causes an API error.
- Graceful fallback: if `ANTHROPIC_API_KEY` is not set, the service returns the first matching KB answer directly without calling Claude. This lets the chatbot work in dev without an API key.
- `ChatWidget` is a floating button mounted in the root layout — visible on every page, works for both authenticated and unauthenticated users (uses `/chat/auth` if session present, `/chat` otherwise).
- `Booking.customerId` relation: bookings belong to `CustomerProfile`, not directly to `User`. The `getUserContext` method must look up via `customerProfile.id`, not `user.id`.
- The `@Optional()` NestJS decorator doesn't suppress guards on a route — two separate endpoints (`/chat` and `/chat/auth`) is cleaner than trying to make auth optional.

**Next Actions:** (added to backlog)

- PayMongo.js card payment widget (P3)
- Mobile: Microsoft/Apple SSO + expo-image-picker KYC (P4)
- npm audit fix pass (P4)

---

## 2026-06-29 — Iteration 13 (Storage Adapter + Disputes + Active Sub-Nav)

**Goal:** Azure Blob Storage adapter for KYC uploads, DisputesModule, active route highlighting in sub-navs
**Outcome:** Done — Milestone: storage-ux (commit 98ae309)
**Findings:**

- `@azure/storage-blob` npm install blocked by `react@18.3.2` exact pin in `apps/mobile/package.json` creating workspace peer dep conflicts. Resolved by implementing `AzureBlobProvider` using the Azure Blob Storage REST API with native `fetch` — no SDK required. PUT request to `https://{account}.blob.core.windows.net/{container}/{blob}?{sasToken}`.
- `Buffer` is not directly assignable to `BodyInit` in the TypeScript types for `fetch` — wrapped with `buffer as any` since Node.js fetch runtime can handle Buffer natively.
- `IStorageProvider` interface with `upload(buffer, filename, mimeType): Promise<string>` is the abstraction boundary. Factory in `StorageModule` selects `LocalDiskProvider` if `AZURE_STORAGE_ACCOUNT` env is not set, else `AzureBlobProvider`.
- Switching `UsersController` from `diskStorage` to `memoryStorage` multer + delegating to `IStorageProvider` means uploads now work on Azure App Service (no persistent local disk).
- `DisputesModule` adds `POST /disputes`, `GET /disputes` (ADMIN-only), `GET /disputes/:id`, `PATCH /disputes/:id/resolve`. The `Dispute` Prisma model was already in the schema — no migration needed.
- `ActiveNavLink` is a `'use client'` component that reads `usePathname()` and applies `bg-blue-50 text-blue-600` when the path matches. It supports an `exact` flag to avoid `/renter` matching `/renter/fleet`.
- Server component layouts can import client components directly — Next.js handles the boundary automatically. No need to extract the nav into a separate layout file.
- `DisputeForm` is shown only for CONFIRMED, ACTIVE, and COMPLETED bookings — not for PENDING or CANCELLED. Submitted disputes show a green confirmation banner; the form collapses after submit.
- Admin `/admin/disputes` page shows all disputes in a table with booking reference, description, status badge, and resolution text. Linked in the admin sub-nav.

**Next Actions:** (added to backlog)

- Embed PayMongo.js card payment widget (P3)
- Mobile: Microsoft/Apple SSO + expo-image-picker KYC (P4)
- AI Chatbot with RAG pipeline and MCP integration (P4)
- npm audit fix pass (P4)

---

## 2026-06-28 — Iteration 0 (Initialization)

**Goal:** Set up loop architecture and seed project state files
**Outcome:** Done
**Findings:**

- Project is greenfield — no code scaffolded yet
- CLAUDE.md updated with full loop architecture, rate-limit handling, and state file conventions
- `docs/loop/` directory initialized with backlog, observations, and placeholder files

**Next Actions:** (added to backlog)

- Scaffold monorepo structure as the first P1 item

---

## 2026-06-28 — Iteration 1 (Monorepo Scaffold)

**Goal:** Scaffold full monorepo — Next.js 15 web, NestJS API, shared package (covers P1 items 1-3)
**Outcome:** Done — pushed as `Milestone: monorepo-scaffold` (commit f275000)
**Findings:**

- `create-next-app` fails inside a workspace root when root `prepare` script calls `husky` before `husky` is installed. Fix: run `npm install --ignore-scripts` + `npx husky init` at root before scaffolding child apps.
- CRLF warnings on Windows are cosmetic — `.prettierrc` has `endOfLine: lf` so Prettier normalises on next format pass. A `.gitattributes` file would suppress the warnings permanently.
- `prisma migrate dev --name init` created the full schema in one shot — all models, enums, relations, and indexes applied cleanly to SQLite.
- Husky + lint-staged ran automatically on the milestone commit and passed (ESLint + Prettier on 48 files).
- 26 npm audit vulnerabilities (21 moderate, 5 high) — these are dev-dependency transitive issues, not production-path. Acceptable for now; flag for a dedicated audit pass.
- `apps/web/CLAUDE.md` and `apps/web/AGENTS.md` were auto-generated by `create-next-app` — these are boilerplate and should be replaced with project-specific content.

**Next Actions:** (added to backlog)

- Add `.gitattributes` to enforce LF line endings across the repo
- Replace `apps/web/CLAUDE.md` and `apps/web/AGENTS.md` with project-specific content
- Implement NextAuth.js (P2) with Google, Microsoft, Apple SSO
- Define remaining Prisma module structure (auth, vehicles, bookings modules)

---

## 2026-06-28 — Iteration 2 (Authentication Foundation)

**Goal:** P1 housekeeping + P2 auth — NextAuth.js SSO on web, JWT auth module on API
**Outcome:** Done — pushed as `Milestone: auth` (commit 37cc650)
**Findings:**

- NextAuth v5 (beta.31) uses `next-auth/providers/microsoft-entra-id` not the old `AzureAD` provider — breaking name change from v4.
- `auth()` (server-side) and `useSession()` (client-side) are both available after wrapping layout with `SessionProvider`; the Suspense boundary is required on the login page because it calls `useSearchParams()`.
- The `/auth/sso` endpoint pattern (NextAuth → API JWT exchange) is clean: NextAuth handles the OAuth dance, then on first sign-in the JWT callback calls our API to upsert the user and return our own token. This token travels in `session.apiToken` and is used for all subsequent API calls.
- `JwtStrategy` + `JwtAuthGuard` pattern is standard NestJS — ready to apply to any future controller with `@UseGuards(JwtAuthGuard)`.
- `.gitattributes` with `* text=auto eol=lf` eliminates CRLF warnings on Windows.
- OAuth credentials (CLIENT_ID/SECRET) still need to be configured in each provider's developer console before auth actually works — documented in `apps/web/.env.local.example`.

**Next Actions:** (added to backlog)

- Scaffold NestJS feature modules: vehicles, bookings, payments, reviews (P2)
- Build home page UI: hero search widget, featured vehicles, top partners (P3)
- Add `apps/web/.env.local.example` note to README so developers know to copy it

---

## 2026-06-28 — Iteration 3 (NestJS API Feature Modules)

**Goal:** Scaffold vehicles, bookings, payments, reviews modules with full CRUD + Swagger docs
**Outcome:** Done — pushed as `Milestone: api-modules` (commit 4151874)
**Findings:**

- Prisma `$transaction` with an async callback is the right pattern for booking concurrency — it runs in a serializable transaction and the conflict check + create happen atomically. SQLite serializes writes by default, so this is sufficient for dev. PostgreSQL in prod will need explicit row-level locking if contention is high.
- The `VehiclesService.search()` availability filter is a two-step query (find booked IDs, then exclude) rather than a subquery — acceptable for SQLite/dev but worth converting to a JOIN when migrating to PostgreSQL.
- `BookingsService` uses `status: status as any` cast to sidestep the Prisma enum type — this is a known pain point when string-typed status values are passed dynamically. A proper fix is to define a `BookingStatus` enum in the service and use it explicitly.
- `PaymentsModule` is a stub — it records payment intent and sets status but does NOT call PayMongo/Stripe yet. A webhook handler is needed to call `confirmPayment()` when the provider posts a success event.
- `RolesGuard` correctly uses `Reflector.getAllAndOverride` so class-level and method-level `@Roles()` decorators both work.
- Lint-staged passed on all 22 files at commit time — Prettier reformatted several files to single-line imports and arrow-function style.

**Next Actions:** (added to backlog)

- Build Next.js home page: hero search widget, featured vehicles, top partners carousel (P3)
- Build vehicle search/results page (P3)
- Fix `status as any` cast in BookingsService with explicit enum (minor cleanup)
- Add PayMongo/Stripe webhook handler to PaymentsModule (P3)

---

## 2026-06-28 — Iteration 4 (Home Page UI)

**Goal:** Next.js home page: hero, featured vehicles, top partners, how-it-works, CTA sections
**Outcome:** Done — pushed as `Milestone: home-page` (commit a959d0a)
**Findings:**

- `SearchWidget` uses `useSearchParams()` so it must be wrapped in a `Suspense` boundary — Next.js 15 enforces this strictly.
- `VehicleCard` and `PartnerCard` are purely presentational; they accept no async data, which keeps the home page fully static (no API needed to render the shell).
- `lib/api.ts` already has `searchVehicles`, `getVehicle`, and `createBooking` typed wrappers ready for the search and detail pages.
- `FilterSidebar` and `Pagination` were started (untracked) at the end of this iteration — ready for the search page.
- `BookingsService` status-as-any cast was fixed with an explicit `BookingStatus` enum import.
- Lint-staged passed on all changed files.

**Next Actions:** (carried into Iteration 5)

- Build vehicle search/results page `/search` with FilterSidebar + grid + Pagination (P3)
- Build vehicle detail page `/vehicle/[id]` with BookingForm (P3)

---

## 2026-06-28 — Iteration 6 (Booking Flow + My Bookings)

**Goal:** End-to-end booking flow: review → confirm+pay stub → confirmation ticket; plus My Bookings list
**Outcome:** Done — pushed as `Milestone: booking-flow` (commit f1bc21a)
**Findings:**

- The API's `BookingsService.create` calculates `totalAmount = days * dailyRate` and `platformFee = totalAmount * 0.05`. Add-ons (child seat, chauffeur) are tracked client-side only — the backend does not yet include them in the total. This is a known gap; the backend needs an `addons` field in `CreateBookingDto` in a future iteration.
- The payment stub flow (POST /bookings → POST /payments/:id → PATCH /payments/:id/confirm) correctly transitions booking status: PENDING → CONFIRMED, and payment status: PENDING → PAID, all within one user action. This is sufficient for the stub; a real webhook handler will replace the explicit confirm call.
- `(dashboard)/layout.tsx` auth guard uses `auth()` server-side — this is the correct pattern for App Router route groups. The guard runs on every request to any route in the group.
- `QrPlaceholder` renders a deterministic 7×7 grid seeded by the booking reference string — purely decorative but visually distinct per booking.
- `session!.apiToken` non-null assertion in `MyBookingsPage` is safe because the layout already guarantees a session exists before any dashboard page renders.
- Prettier formatted ternary chains in the bookings list to a nested ternary — acceptable under the lint rules.

**Next Actions:** (added to backlog)

- Build Renter Dashboard: fleet management, booking management, revenue BI (P3)
- Build Admin Dashboard: user management, platform BI, commission config (P3)
- Add add-ons support to `CreateBookingDto` and `BookingsService` so backend total matches frontend (P3)

---

## 2026-06-28 — Iteration 7 (Renter Dashboard)

**Goal:** Renter Portal — fleet CRUD, booking management, revenue stats
**Outcome:** Done — pushed as `Milestone: renter-dashboard` (commit f34d2f9)
**Findings:**

- `GET /vehicles/my` must be registered BEFORE `GET /:id` in the NestJS controller — otherwise `my` is matched as an ID parameter. This is a standard NestJS routing order requirement.
- `await auth()` without assigning the return value still satisfies the layout guard requirement (layout already checks session before rendering children). In edit page, no session value was needed after the auth guard ran.
- `@typescript-eslint/no-unused-vars` catches `const x = await fn()` where x is not used — use `await fn()` with no assignment.
- `Promise.allSettled` is the correct pattern for parallel server-side data fetching when partial failure is acceptable (one endpoint down shouldn't crash the whole page).
- The Renter layout sub-nav uses plain `Link` components without an `active` state — a future iteration should highlight the current route using `usePathname()` in a client component wrapper.
- VehicleForm's `set()` helper simplifies controlled form state updates without verbose `onChange` handlers per field.

**Next Actions:** (added to backlog)

- Build Admin Dashboard: user management, platform BI, commission config (P3)
- Add active route highlighting to Renter sub-nav (minor UX)

---

## 2026-06-29 — Iteration 12 (React Native Mobile App)

**Goal:** Expo React Native app with NativeWind — core booking flow mirroring the web app
**Outcome:** Done — Milestone: mobile-app
**Findings:**

- Expo 52 + Expo Router 4 (file-based routing) mirrors Next.js App Router conventions — same mental model, `app/` directory with `_layout.tsx` files.
- NativeWind 4 requires `babel-preset-expo` with `jsxImportSource: 'nativewind'`, the `nativewind/babel` plugin, and `withNativeWind` in `metro.config.js`. All three are needed.
- `expo-secure-store` handles persistent auth token storage on device — more secure than AsyncStorage for JWT tokens.
- Auth flow: Google SSO via `expo-auth-session` → get access token → fetch Google user info → POST `/auth/sso` → receive our API JWT → store in SecureStore. Same `/auth/sso` endpoint as the web.
- `useFocusEffect` + `useCallback` is the correct pattern for refreshing data when navigating back to a tab screen — `useEffect` alone doesn't re-fire on tab refocus.
- Expo Router `useLocalSearchParams` replaces Next.js `useSearchParams` — same concept, different import.
- Vehicle detail screen uses `require('react-native')` inside a nested component — this is a workaround for TypeScript circular reference avoidance; cleaner to import at top level (refactor later).
- KYC document uploads on mobile point users to the web app (`rentacar.app/profile/kyc`) — mobile camera-based document upload is a future enhancement.
- Microsoft and Apple SSO buttons show "coming soon" alert — `expo-auth-session` supports both, but requires additional OAuth app configuration in Azure AD and Apple Developer portal.
- NativeWind `gap-*` utilities work on React Native with `flex-row` but require wrapping `View` to have `flexWrap: wrap` for multi-row layouts.

**Next Actions:** (added to backlog)

- AI Chatbot with RAG pipeline and MCP integration (P4)
- Mobile: Microsoft/Apple SSO for login screen (P4)
- Mobile: camera-based KYC document upload via expo-image-picker (P4)

---

## 2026-06-29 — Iteration 11 (CI/CD + Deployment Config)

**Goal:** GitHub Actions CI/CD pipeline, Azure App Service deployment, Nginx reverse proxy config
**Outcome:** Done — Milestone: deployment
**Findings:**

- `ci.yml` runs two jobs: `lint-and-build` (ESLint + tsc build for both apps) and `test-api` (jest unit tests). Split to fail fast on lint before running heavier tests.
- Web build in CI requires `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_API_URL` as env vars — Next.js fails to build without them (compile-time validation).
- `deploy.yml` deploys API first, then web (`needs: deploy-api`) to ensure DB migrations run before the web app goes live.
- `prisma migrate deploy` (not `migrate dev`) is the correct production migration command — it applies pending migrations without creating new ones.
- Nginx `nginx.conf` covers both HTTP (redirect) and HTTPS (SSL) server blocks. `/api/*` and `/uploads/*` proxy to the NestJS process; `/` proxies to Next.js.
- Azure App Service (Linux) runs Node.js natively without Docker — the `azure/webapps-deploy@v3` action deploys the built package directory.
- For KYC document uploads in production, `apps/api/uploads/` should be replaced with Azure Blob Storage (connection string in env). The current disk-based storage won't survive App Service restarts or scaling — flagged in `.env.production.example`.
- `docs/deployment.md` documents the one-time Azure CLI setup, all required GitHub secrets, App Service env vars, and migration commands.

**Next Actions:** (added to backlog)

- React Native (Expo) mobile app — mirror web booking flow (P4)
- AI Chatbot with RAG pipeline and MCP integration (P4)
- Replace disk-based KYC upload with Azure Blob Storage adapter (P3)

---

## 2026-06-28 — Iteration 10 (Payment Provider Integration)

**Goal:** Replace hard-coded stub with a real payment provider abstraction (IPaymentProvider); add PayMongo adapter and webhook handler
**Outcome:** Done — Milestone: payments
**Findings:**

- `IPaymentProvider` interface with `createIntent()`, `verifyWebhookSignature()`, `extractBookingIdFromWebhook()`, `isSuccessEvent()` cleanly separates the payment flow from provider details.
- `StubPaymentProvider` returns `directConfirm: true` and `checkoutUrl: null` — the flow immediately confirms the payment and navigates to the booking confirmation page. No change to user-visible behavior in dev.
- `PaymongoPaymentProvider` uses `POST /v1/sources` (e-wallet flow: GCash, Maya). Card payments via PayMongo require embedded JS (PayMongo.js) — deferred to a future iteration.
- NestJS `rawBody: true` factory option is required for the webhook endpoint to access the raw request body for HMAC verification. Without it, `req.rawBody` is undefined.
- `PaymentsModule` provider factory reads `PAYMONGO_SECRET_KEY` at startup — stub if blank, PayMongo if set. No code changes needed to switch modes.
- `POST /payments/:bookingId/initiate` is the new canonical payment entry point. The legacy `POST /payments/:bookingId` endpoint is kept for backward compat.
- Frontend `ReviewClient` now calls `initiatePayment()`; if `checkoutUrl` is non-null it redirects via `window.location.href` (works for e-wallet redirect flow); if null (stub), navigates via Next.js router.
- PayMongo amounts are in centavos (`amount * 100`) — easy to miss; documented in the provider code.
- `PAYMONGO_SECRET_KEY` and `PAYMONGO_WEBHOOK_SECRET` added to `.env.example`.

**Next Actions:** (added to backlog)

- Embed PayMongo.js card payment widget on the review page (P3)
- GitHub Actions CI/CD pipeline + Azure App Service deployment config (P4)

---

## 2026-06-28 — Iteration 9 (Add-ons Alignment + KYC Document Upload)

**Goal:** Wire backend add-ons into booking total; KYC document upload flow for users and renters
**Outcome:** Done — Milestone: addons-kyc
**Findings:**

- `addonsAmount Float @default(0)` added to Booking model via migration `add-booking-addons`. SQLite migration applied cleanly.
- Backend now computes `addonsAmount = (childSeat ? 500*days : 0) + (chauffeur ? 1500*days : 0)` and includes it in `totalAmount`. `platformFee` is now `Math.round(totalAmount * 0.05)` for integer precision.
- `@types/multer` is a devDependency — `multer` itself comes from `@nestjs/platform-express` which ships it bundled. No runtime dependency needed.
- `NestFactory.create<NestExpressApplication>()` with `app.useStaticAssets()` serves `apps/api/uploads/` at `/uploads/:filename` — this is outside the `api/v1` global prefix so files are directly accessible at `http://localhost:4000/uploads/...`.
- `POST /users/documents/:type` uses `FileInterceptor` with `diskStorage`, 5 MB limit, JPEG/PNG/PDF filter. On success it updates the matching profile URL field (customer or renter) and returns `{ data: { fileUrl } }`.
- Frontend `uploadDocument()` uses `fetch` directly (not `apiFetch`) since it sends `FormData` not JSON — no `Content-Type` header needed (browser sets multipart boundary automatically).
- KYC page auto-detects role from session and shows either customer docs (license + secondary ID) or renter docs (business permit + company reg). Badge shows current KYC status from API.
- After uploading, admin updates KYC status manually via the admin dashboard — there is no automatic status transition on upload (by design: human verification is required).

**Next Actions:** (added to backlog)

- Integrate PayMongo/Stripe + webhook handler for real payment confirmation (P3)
- GitHub Actions CI/CD pipeline + Azure App Service deployment config (P4)

---

## 2026-06-28 — Iteration 8 (Admin Dashboard)

**Goal:** Admin Portal — platform GMV/commission stats, user management + KYC, per-renter commission config
**Outcome:** Done — Milestone: admin-dashboard
**Findings:**

- `AdminService.getStats()` uses Prisma `$transaction` with 8 parallel queries (groupBy + aggregate) — atomic read snapshot avoids inconsistent counts between queries.
- `$transaction` with an array of promises is read-only (no writes); this is safe and avoids locking.
- `GET /admin/stats` returns `gmv.total`, `gmv.mtd`, `commission.total`, `commission.mtd`, breakdowns by user role, vehicle status, booking status, and 10 most recent bookings.
- `CommissionEditor` uses an inline edit pattern: display-only → edit mode → save/cancel. `value` is stored as a string percentage (e.g., "5.0") and divided by 100 before sending to the API. This avoids floating-point confusion in the input field.
- `KycActions` dropdown is a custom popover (not a native `<select>`) — allows cleaner styling and avoids the browser default select appearance. It closes on item select.
- Admin layout guards all `/admin/*` routes to ADMIN role via `auth()` server-side — same pattern as the Renter layout.
- Navbar now shows role-specific links: `Admin` for ADMIN, `Dashboard` for RENTER — both desktop and mobile menus updated.
- `getAdminStats` return type includes `recentBookings` with nested `vehicle` and `renter` — the Prisma `include` shape matches the TypeScript interface defined in `lib/api.ts`.

**Next Actions:** (added to backlog)

- Add `addons` field to `CreateBookingDto` + `BookingsService` so backend total matches frontend (P3)
- Integrate PayMongo/Stripe + webhook handler for real payment confirmation (P3)
- KYC document upload flow with file storage abstraction (P2)
- GitHub Actions CI/CD + Azure App Service deployment config (P4)

---

## 2026-06-28 — Iteration 5 (Search + Vehicle Detail Pages)

**Goal:** `/search` results page + `/vehicle/[id]` detail page with live booking form
**Outcome:** Done — pushed as `Milestone: search-and-detail` (commit 6555524)
**Findings:**

- Next.js 15 `searchParams` and `params` in page components are now Promises — must `await` them before reading values. The `async function Page({ searchParams }: { searchParams: Promise<...> })` pattern is required.
- `force-dynamic` export is needed on the search page so each request re-reads URL params (otherwise Next.js statically renders the page at build time with empty params).
- `imageUrls` is stored in the DB as a JSON string — parsing must be wrapped in try/catch since the value could be malformed.
- `FilterSidebar` and `Pagination` use `useSearchParams()` and must each be wrapped in a `<Suspense>` boundary when composed inside a Server Component.
- Ternary-as-statement (`condition ? a() : b()`) is flagged by `@typescript-eslint/no-unused-expressions` — use `if/else` instead.
- `BookingForm` correctly computes platform fee (5%) and guards the "Proceed to Review" button: unauthenticated users are redirected to `/login?callbackUrl=...`; authenticated users go to `/booking/review` with query params.
- Husky + lint-staged (ESLint + Prettier) passed on all 11 changed files after fixing the ternary.

**Next Actions:** (added to backlog)

- Build booking review page `/booking/review` — show full price breakdown, confirm details (P3)
- Build payment page `/booking/payment` — Stripe/PayMongo checkout integration (P3)
- Build booking confirmation page `/booking/[id]` — QR code, reference number, pickup details (P3)
