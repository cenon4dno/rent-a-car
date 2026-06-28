# Current Plan — Iteration 6

**Goal:** Booking flow (review → confirm & pay stub → confirmation) + My Bookings page
**Started:** 2026-06-28
**Milestone commit tag:** `booking-flow`

## Acceptance Criteria

- `/booking/review` reads vehicle/date/addon params, shows price breakdown, payment method selector
- "Confirm & Pay" creates booking → creates payment → confirms payment (stub) → redirects to `/booking/[id]`
- `/booking/[id]` shows confirmation ticket (reference, vehicle summary, dates, status, total)
- `/bookings` lists all user bookings with status badges and vehicle names
- Navbar shows "My Bookings" link for authenticated users
- Auth guard layout protects all `/booking/*` and `/bookings` routes

## Steps

1. [x] Write plan (current-plan.md)
2. [ ] Extend `lib/api.ts` with booking/payment types and API helpers
3. [ ] Create `app/(dashboard)/layout.tsx` — auth redirect guard
4. [ ] Create `app/(dashboard)/booking/review/page.tsx` + `ReviewClient.tsx`
5. [ ] Create `app/(dashboard)/booking/[id]/page.tsx` — confirmation page
6. [ ] Create `app/(dashboard)/bookings/page.tsx` — My Bookings list
7. [ ] Update `Navbar.tsx` — My Bookings link for authenticated users
8. [ ] Commit + push → Milestone: booking-flow
9. [ ] Update observations, backlog, clear plan

## Cutpoint

Write last completed step to session-state.md and schedule wakeup if rate limit hit.
