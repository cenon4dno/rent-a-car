# apps/api — NestJS Backend API

The shared backend for the web and mobile apps. Provides REST endpoints and a WebSocket gateway for real-time messaging.

- **Base URL (dev):** `http://localhost:4000/api/v1`
- **Swagger UI:** `http://localhost:4000/api/docs`
- **WebSocket:** `ws://localhost:4000/ws`

## Modules

| Module        | Path                 | Key endpoints                                    |
| ------------- | -------------------- | ------------------------------------------------ |
| Auth          | `src/auth/`          | POST /auth/sso, POST /auth/login, GET /auth/me   |
| Users         | `src/users/`         | GET/PATCH /users/me, POST /users/kyc/upload      |
| Vehicles      | `src/vehicles/`      | GET /vehicles (search), CRUD, analytics          |
| Bookings      | `src/bookings/`      | CRUD, confirm/cancel/complete, SOS, late-return  |
| Payments      | `src/payments/`      | PayMongo intents, webhooks, refunds              |
| Drivers       | `src/drivers/`       | Register, list, schedule dashboard               |
| Reviews       | `src/reviews/`       | Two-way rating (customer ↔ vehicle/renter)       |
| Messages      | `src/messages/`      | Conversations, REST + WebSocket real-time        |
| Feedback      | `src/feedback/`      | Submit, list, admin reply/status                 |
| Admin         | `src/admin/`         | User management, BI, commission, homepage config |
| KYC           | `src/kyc/`           | Onfido/Veriff integration stubs, webhook HMAC    |
| Legal         | `src/legal/`         | CMS for T&C / Privacy pages                      |
| Notifications | `src/notifications/` | Nodemailer email for booking events              |

See [docs/api.md](../../docs/api.md) for the full endpoint reference.

## Running locally

```bash
# From repo root
npm run dev:api             # watch mode, http://localhost:4000

# From apps/api
npm run start:dev           # same
npm run start:debug         # with Node.js debugger
```

## Database

```bash
# Apply migrations
npx prisma migrate dev

# Seed default accounts + sample data
npm run db:seed

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Reset and reseed from scratch
rm prisma/dev.db
npx prisma migrate dev
npm run db:seed
```

## Environment variables

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-jwt-secret"
PORT=4000
ALLOWED_ORIGINS="http://localhost:3000"

# Seed passwords (fallback: password123)
ADMIN_SEED_PASSWORD=
RENTER_SEED_PASSWORD=
DEV_USER_SEED_PASSWORD=
DEV_DRIVER_SEED_PASSWORD=

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@rentacar.ph

# PayMongo (optional)
PAYMONGO_SECRET_KEY=
PAYMONGO_WEBHOOK_SECRET=

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=

# KYC provider (optional)
KYC_PROVIDER=
ONFIDO_API_TOKEN=
VERIFF_API_KEY=
VERIFF_SECRET=

# Azure Blob Storage (optional — falls back to disk)
AZURE_STORAGE_CONNECTION_STRING=
AZURE_STORAGE_CONTAINER=
```

## Testing

```bash
npm run test          # Jest unit tests
npm run test:cov      # with coverage report
npm run test:e2e      # end-to-end (requires running DB)
```
