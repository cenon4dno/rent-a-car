# apps/web — Next.js 15 Web Frontend

The customer-facing and admin web application for the RentACar marketplace. Built with Next.js 15 App Router and Tailwind CSS.

## Key conventions

- **App Router** only — all routes live under `app/`. No `pages/` directory.
- **Server Components by default** — add `'use client'` only when browser APIs or interactivity are required.
- **Tailwind CSS** for all styling — no CSS modules or styled-components.
- **State management** — Zustand for client-side global state (booking flow, compare tray).
- **API calls** — typed fetch helpers in `lib/api.ts`. Never call the database directly from the web app.
- **Auth** — NextAuth.js v5. Use `useSession()` in client components, `auth()` in server components.

## Structure

```
app/
  (auth)/login/             Login page — SSO + email/password
  (public)/                 Unauthenticated pages
    home/                   Homepage with hero, featured cars, partners
    search/                 Vehicle search results + filters
    vehicle/[id]/           Vehicle detail + booking form
    renter/[id]/            Public renter profile
    driver/[id]/            Public driver profile
    customer/[id]/          Customer profile (renter/admin only)
    how-it-works/           How the platform works
    partners/               Partner rental companies directory
    contact/                Contact form
    feedback/               Complaints and feedback form
    legal/[slug]/           Dynamic legal pages (T&C, Privacy, etc.)
    compare/                Side-by-side vehicle comparison
  (dashboard)/              Authenticated pages
    bookings/               My bookings list
    messages/               Inbox + conversation threads (WebSocket)
    profile/                User profile + KYC documents
    admin/                  Admin dashboard
      users/                User management
      feedback/             Feedback inbox with reply/status
      homepage/             Carousel + featured vehicle editor
      legal/                CMS for legal pages
      disputes/             Dispute resolution tickets
      analytics/            Platform BI (GMV, commission, health)
    renter/                 Renter dashboard
      fleet/                Vehicle CRUD
      bookings/             Booking management
      analytics/            Fleet utilization + revenue BI
    driver/
      dashboard/            Driver schedule + active bookings
  api/auth/[...nextauth]/   NextAuth route handler

components/
  ui/                       Atoms: Button, Badge, VehicleCard, PartnerCard
  layout/                   Navbar, Footer
  booking/                  BookingForm, DatePicker, AddOns
  maps/                     LocationAutocomplete, MapLocationPicker

lib/
  auth.ts                   NextAuth config (providers, callbacks, JWT shape)
  api.ts                    Typed fetch helpers for the NestJS API
  googleMaps.ts             Google Maps JS loader
```

## Running locally

```bash
# From repo root
npm run dev:web             # http://localhost:3000

# From apps/web
npm run dev
npm run build
npm run lint
```

## Environment variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-string>
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# SSO providers (all optional in dev)
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ISSUER=
AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=

# Google Maps (location autocomplete — degrades gracefully without key)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```
