# Web App — Agent Notes

This is the **rent-a-car** Next.js 15 web frontend (App Router).

## Key conventions

- All routes live under `app/` — no `pages/` directory.
- Server Components are the default; add `'use client'` only when browser APIs or interactivity are required.
- Tailwind CSS for all styling — no CSS modules or styled-components.
- State management: Zustand for client-side global state (cart, filters, booking flow).
- API calls go to `apps/api` (NestJS) at `NEXT_PUBLIC_API_URL` — never call the DB directly from the web app.
- Auth via NextAuth.js — session available via `useSession()` (client) or `auth()` (server).

## Structure

```
app/
  (auth)/login/        — login page with SSO buttons
  (public)/            — unauthenticated pages (home, search, vehicle detail)
  (dashboard)/         — authenticated pages (bookings, profile, renter/admin dashboards)
  api/auth/[...nextauth]/ — NextAuth route handler
components/
  ui/                  — atomic design: atoms, molecules, organisms
  layout/              — header, footer, nav
lib/
  auth.ts              — NextAuth config
  api.ts               — typed fetch helpers for the NestJS API
```
