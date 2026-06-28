# Current Plan — Iteration 5

**Goal:** Vehicle search/results page + vehicle detail page with booking form
**Started:** 2026-06-28
**Milestone commit tag:** `search-and-detail`

## Acceptance Criteria

- `lib/api.ts` exports `VehicleWithRenter` and `VehicleDetail` types matching API responses
- `/search` page renders vehicle grid with FilterSidebar, Pagination, and result count
- `/search` handles empty results gracefully
- `/vehicle/[id]` page renders specs, images, renter info, recent reviews, and booking form
- `BookingForm` computes live price breakdown (base rate × days + add-ons + 5% fee)
- "Proceed to Review" navigates to `/booking/review` with query params
- Both routes have loading skeletons

## Steps

1. [x] Close Iteration 4 — update current-plan.md + observations.md
2. [ ] Extend `lib/api.ts` with `VehicleWithRenter` and `VehicleDetail` types
3. [ ] Create `app/(public)/search/page.tsx`
4. [ ] Create `app/(public)/search/loading.tsx`
5. [ ] Create `app/(public)/vehicle/[id]/page.tsx`
6. [ ] Create `app/(public)/vehicle/[id]/BookingForm.tsx`
7. [ ] Create `app/(public)/vehicle/[id]/loading.tsx`
8. [ ] Commit + push → Milestone: search-and-detail
9. [ ] Update observations, backlog, clear plan

## Cutpoint

Write last completed step to session-state.md and schedule wakeup if rate limit hit.
