# RentACar — Multi-Tenant Car Rental Marketplace

A marketplace platform where multiple car rental companies list their fleets and customers book vehicles in one unified experience — similar to Grab or Airbnb, but for car rentals.

## Architecture

```
rent-a-car/
├── apps/
│   ├── web/       # Next.js 15 — customer and admin web app
│   ├── api/       # NestJS — shared REST + WebSocket API + Prisma ORM
│   └── mobile/    # React Native (Expo) — iOS and Android
├── packages/      # Shared packages (future use)
├── nginx/         # Reverse proxy config
└── docs/          # Setup, API reference, deployment, build guides
```

**Internet → Nginx (port 80/443) → Next.js (3000) / NestJS API (4000)**

## Tech Stack

| Layer          | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| Web frontend   | Next.js 15, React 18, Tailwind CSS                             |
| Mobile         | React Native 0.76, Expo 52, NativeWind                         |
| Backend API    | NestJS 11, Passport JWT, Socket.io, Swagger                    |
| Database       | Prisma ORM — SQLite (dev) / PostgreSQL (prod)                  |
| Auth           | NextAuth v5 — Google, Microsoft, Apple, Meta SSO + credentials |
| Payments       | PayMongo (GCash, Maya, cards)                                  |
| Infrastructure | Azure App Service, Nginx, GitHub Actions CI/CD                 |
| Code quality   | ESLint, Prettier, Husky pre-commit hooks                       |

## Documentation

| Document                                     | Description                                 |
| -------------------------------------------- | ------------------------------------------- |
| [docs/local-setup.md](docs/local-setup.md)   | Full local dev environment setup + env vars |
| [docs/api.md](docs/api.md)                   | REST + WebSocket API reference              |
| [docs/mobile-build.md](docs/mobile-build.md) | Building the Android APK for testing        |
| [docs/deployment.md](docs/deployment.md)     | Azure App Service production deployment     |

## Prerequisites

- Node.js >= 20
- npm >= 10

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

See [docs/local-setup.md](docs/local-setup.md) for the full list. Minimum required:

**API** (`apps/api/.env`):

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-jwt-secret"
PORT=4000
ALLOWED_ORIGINS="http://localhost:3000"
```

**Web** (`apps/web/.env.local`):

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Set up the database

```bash
cd apps/api
npx prisma migrate dev
npm run db:seed
```

### 4. Start development servers

```bash
# From repo root — run each in a separate terminal
npm run dev:api   # NestJS API on http://localhost:4000
npm run dev:web   # Next.js web on http://localhost:3000
```

Swagger UI: `http://localhost:4000/api/docs`

**Mobile:**

```bash
cd apps/mobile
npx expo start    # scan QR with Expo Go app
```

## Dev Accounts (after seeding)

| Role     | Email                       | Password env var           | Fallback      |
| -------- | --------------------------- | -------------------------- | ------------- |
| Admin    | `cenon4dno@gmail.com`       | `ADMIN_SEED_PASSWORD`      | `password123` |
| Renter   | `metrocarrentals@dev.local` | `RENTER_SEED_PASSWORD`     | `password123` |
| Customer | `testuser@dev.local`        | `DEV_USER_SEED_PASSWORD`   | `password123` |
| Driver   | `testdriver@dev.local`      | `DEV_DRIVER_SEED_PASSWORD` | `password123` |

## Available Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev:web`   | Start Next.js dev server             |
| `npm run dev:api`   | Start NestJS dev server (watch mode) |
| `npm run build:web` | Build web for production             |
| `npm run build:api` | Build API for production             |
| `npm run lint`      | Lint all workspaces                  |
| `npm run format`    | Format all files with Prettier       |

**API database scripts** (run from `apps/api`):

| Command               | Description              |
| --------------------- | ------------------------ |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate`  | Run pending migrations   |
| `npm run db:studio`   | Open Prisma Studio       |
| `npm run db:seed`     | Seed demo data           |

**Testing** (run from `apps/web`):

| Command                   | Description                        |
| ------------------------- | ---------------------------------- |
| `npm run test:e2e`        | Run Playwright E2E tests           |
| `npm run test:e2e:headed` | Run E2E tests with browser visible |
| `npm run test:e2e:ui`     | Open Playwright UI                 |

## Playwright E2E Testing

Tests live in `apps/web/e2e/` and target the Next.js web app.

### Prerequisites

Install Playwright browsers once after cloning (or after upgrading Playwright):

```bash
cd apps/web
npx playwright install
```

To install only specific browsers:

```bash
npx playwright install chromium
npx playwright install chromium firefox webkit
```

### Running Tests

The web dev server must be running (`npm run dev:web`) before executing E2E tests, or use the `webServer` config in `playwright.config.ts` which starts it automatically.

```bash
# From apps/web

# Run all tests headlessly (CI default)
npm run test:e2e

# Run with browser window visible
npm run test:e2e:headed

# Open interactive Playwright UI (recommended for local dev)
npm run test:e2e:ui

# Run a specific test file
npx playwright test e2e/home.spec.ts

# Run tests matching a title pattern
npx playwright test -g "home page"

# Run in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with verbose output
npx playwright test --reporter=list

# Retry flaky tests (useful in CI)
npx playwright test --retries=2
```

### Debugging

```bash
# Step through a test with the Playwright Inspector
npx playwright test --debug

# Pause at a specific line using page.pause() in your test
# then run:
npx playwright test --headed --timeout=0
```

### Viewing Reports

After a test run, open the HTML report:

```bash
npx playwright show-report
```

The report is saved to `apps/web/playwright-report/` and shows pass/fail status, traces, screenshots, and videos for failed tests.

### Config

Playwright configuration is at [apps/web/playwright.config.ts](apps/web/playwright.config.ts). Key settings:

| Setting        | Value                     |
| -------------- | ------------------------- |
| Base URL       | `http://localhost:3000`   |
| Test directory | `e2e/`                    |
| Browsers       | Chromium, Firefox, WebKit |
| Screenshots    | On failure                |
| Traces         | On first retry            |

## API Documentation

Swagger UI is available at `http://localhost:4000/api/docs` when the API is running.

## User Roles

| Role         | Description                                          |
| ------------ | ---------------------------------------------------- |
| **Admin**    | Platform owner — manages all users, disputes, and BI |
| **Renter**   | Car rental company — posts fleet, manages bookings   |
| **Driver**   | Chauffeur registered by a Renter                     |
| **Customer** | Individual renting a car                             |

## Deployment

See [docs/deployment.md](docs/deployment.md) for the full Azure App Service deployment guide including Nginx configuration and GitHub Actions CI/CD setup.

**Key secrets required in GitHub Actions:**

- `AZURE_CREDENTIALS` — service principal JSON
- `ACR_LOGIN_SERVER`, `ACR_USERNAME`, `ACR_PASSWORD` — Azure Container Registry
- `DATABASE_URL`, `JWT_SECRET`, `AUTH_SECRET` — app secrets

## Business Model

The platform deducts a **5% commission** from all transactions (configurable globally or per tenant via Admin dashboard).

## License

Private — all rights reserved.
