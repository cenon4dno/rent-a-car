# Local Development Setup

## Prerequisites

| Tool    | Min version | Notes                |
| ------- | ----------- | -------------------- |
| Node.js | 20.x LTS    | `node --version`     |
| npm     | 10.x        | bundled with Node 20 |
| Git     | any         | —                    |

Optional (mobile only):

| Tool                         | Notes                                   |
| ---------------------------- | --------------------------------------- |
| Android Studio / Android SDK | Needed for local APK builds             |
| Java JDK 17                  | Required by Gradle                      |
| Expo Go app                  | Instant testing without building an APK |

---

## 1 — Clone and Install

```bash
git clone https://github.com/cenon4dno/rent-a-car.git
cd rent-a-car
npm install        # installs all workspaces
```

---

## 2 — Environment Variables

### API (`apps/api/.env`)

```env
# Database (SQLite for local dev — path is relative to apps/api)
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="dev-jwt-secret-change-in-prod"

# API port
PORT=4000

# CORS — comma-separated allowed origins
ALLOWED_ORIGINS="http://localhost:3000"

# Seed passwords (fallback: password123)
ADMIN_SEED_PASSWORD="password123"
RENTER_SEED_PASSWORD="password123"
DEV_USER_SEED_PASSWORD="password123"
DEV_DRIVER_SEED_PASSWORD="password123"

# Email (optional — skip to suppress email sending)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM="noreply@rentacar.ph"

# PayMongo (optional — skip for dev without payments)
PAYMONGO_SECRET_KEY=""
PAYMONGO_WEBHOOK_SECRET=""

# Google Maps (optional — autocomplete degrades gracefully without it)
GOOGLE_MAPS_API_KEY=""

# KYC provider (optional — "onfido" or "veriff")
KYC_PROVIDER=""
ONFIDO_API_TOKEN=""
VERIFF_API_KEY=""
VERIFF_SECRET=""

# Azure Blob Storage (optional — file uploads stored on disk without it)
AZURE_STORAGE_CONNECTION_STRING=""
AZURE_STORAGE_CONTAINER=""
```

### Web (`apps/web/.env.local`)

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret-change-in-prod"

NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"

# Google OAuth (required for Google SSO)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# Microsoft Entra ID (required for Microsoft SSO)
AUTH_MICROSOFT_ENTRA_ID_ID=""
AUTH_MICROSOFT_ENTRA_ID_SECRET=""
AUTH_MICROSOFT_ENTRA_ID_ISSUER=""

# Facebook (required for Meta SSO)
AUTH_FACEBOOK_ID=""
AUTH_FACEBOOK_SECRET=""

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

### Mobile (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL="http://10.0.2.2:4000/api/v1"
# Use 10.0.2.2 for Android emulator (maps to host localhost)
# Use your LAN IP (e.g. 192.168.1.x) for a physical device
```

---

## 3 — Database Setup

```bash
cd apps/api

# Apply all migrations and create dev.db
npx prisma migrate dev

# Seed default accounts and sample data
npm run db:seed

# (Optional) open Prisma Studio to browse the DB
npm run db:studio
```

To reset and reseed from scratch:

```bash
rm prisma/dev.db   # or del prisma\dev.db on Windows
npx prisma migrate dev
npm run db:seed
```

---

## 4 — Running the Apps

Open two terminals:

```bash
# Terminal 1 — API
npm run dev:api        # http://localhost:4000

# Terminal 2 — Web
npm run dev:web        # http://localhost:3000
```

Swagger UI (API docs):

```
http://localhost:4000/api/docs
```

---

## 5 — Mobile (Expo)

### Option A — Expo Go (quickest, no build needed)

```bash
cd apps/mobile
npx expo start
```

Scan the QR code with the Expo Go app on your phone. Make sure `EXPO_PUBLIC_API_URL` points to your machine's LAN IP.

### Option B — Local APK build

See [mobile-build.md](mobile-build.md) for the full step-by-step build guide.

---

## 6 — Code Quality

```bash
# Lint all workspaces
npm run lint

# Format all files
npm run format
```

Pre-commit hooks (Husky + lint-staged) run ESLint and Prettier automatically on staged files before every commit.

---

## 7 — Common Issues

### `prisma migrate dev` fails with schema drift

```bash
rm apps/api/prisma/dev.db
npx prisma migrate dev --name init    # run from apps/api
```

### API starts but 401 on all requests

Check that `JWT_SECRET` in `.env` matches what was used to sign existing tokens. If you changed it, re-log in.

### Web shows "Failed to fetch" / CORS errors

Ensure `ALLOWED_ORIGINS` in `apps/api/.env` includes `http://localhost:3000` and that `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` points to `http://localhost:4000/api/v1`.

### Google Maps autocomplete not working

The location fields degrade gracefully to plain text input when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is not set. This is expected in dev without a key.
