# Rent-a-Car

A multi-tenant car rental marketplace — think Uber for car rentals. Rental companies post their fleets, customers search and book, and the platform handles scheduling, payments, and BI dashboards.

## Architecture

```
rent-a-car/
├── apps/
│   ├── web/       # Next.js 16 — customer and admin web app
│   ├── api/       # NestJS — shared REST API + Prisma ORM
│   └── mobile/    # React Native (Expo) — iOS and Android
├── packages/
│   └── shared/    # Shared types and utilities
├── nginx/         # Reverse proxy config
└── docs/          # Loop state, deployment guide, backlog
```

**Internet → Nginx (port 80/443) → Next.js (3000) / NestJS API (4000)**

## Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Web frontend   | Next.js 16, React 19, Tailwind CSS v4          |
| Mobile         | React Native 0.76, Expo 52, NativeWind         |
| Backend API    | NestJS 11, Passport JWT, Swagger               |
| Database       | Prisma ORM — SQLite (dev) / PostgreSQL (prod)  |
| Auth           | NextAuth v5 — Google, Microsoft, Apple SSO     |
| Payments       | PayMongo (GCash, Maya, cards)                  |
| Infrastructure | Azure App Service, Nginx, GitHub Actions CI/CD |
| Code quality   | ESLint, Prettier, Husky pre-commit hooks       |
| Testing        | Jest (unit), Playwright (E2E)                  |

## Prerequisites

- Node.js >= 20
- npm >= 10

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

**API** (`apps/api/.env`):

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-strong-secret-here"
PORT=4000
ALLOWED_ORIGINS="http://localhost:3000"

# Optional — leave blank to use stub payments in dev
PAYMONGO_SECRET_KEY=
PAYMONGO_WEBHOOK_SECRET=
```

**Web** (`apps/web/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000

# Generate with: openssl rand -hex 32
AUTH_SECRET=your-auth-secret-here

# Google OAuth — https://console.cloud.google.com
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Microsoft (Azure AD) — https://portal.azure.com
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common

# Apple Sign In — https://developer.apple.com
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

### 3. Set up the database

```bash
cd apps/api
npm run db:migrate   # run migrations
npm run db:seed      # seed demo data
```

### 4. Start development servers

```bash
# From repo root — run each in a separate terminal
npm run dev:api   # NestJS API on http://localhost:4000
npm run dev:web   # Next.js web on http://localhost:3000
```

**Mobile:**

```bash
cd apps/mobile
npx expo start
```

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
