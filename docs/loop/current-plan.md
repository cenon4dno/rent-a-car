# Current Plan — Iteration 4

**Goal:** Next.js home page UI + minor API cleanup
**Started:** 2026-06-28
**Milestone commit tag:** `home-page`

## Acceptance Criteria

- `BookingsService` status cast fixed (no more `as any`)
- `lib/api.ts` exports typed fetch helpers for vehicles and bookings
- Shared UI atoms: `Button`, `Badge`, `VehicleCard`, `PartnerCard`
- Layout: `Navbar` (logo + nav + auth), `Footer`
- `SearchWidget` client component (location, pick-up date, drop-off date → `/search`)
- Home page sections: Hero, Featured Vehicles, Top Partners, How It Works
- Home page renders with Tailwind styling and is fully static (no API required to render shell)

## Steps

1. [x] Write plan + fix BookingsService status cast
2. [ ] `lib/api.ts` — typed GET /vehicles and POST /bookings wrappers
3. [ ] UI atoms: `Button`, `Badge`, `VehicleCard`, `PartnerCard`
4. [ ] Layout: `Navbar`, `Footer`
5. [ ] `SearchWidget` client component
6. [ ] Home `app/page.tsx` — hero + featured + how-it-works + partners
7. [ ] Commit + push → Milestone: home-page

## Cutpoint

Write last completed step to session-state.md and schedule wakeup.
