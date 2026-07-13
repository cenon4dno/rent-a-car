# Current Plan — Finish All Active Backlog (started 2026-07-13)

**Goal:** Complete all 10 active backlog items, one commit + push per task.

## Order of execution

1. [P2] Profile page for every user type with integrated KYC
2. [P2] Home page quick-booking location with Google Maps (build shared Maps autocomplete here)
3. [P2] Vehicle operating location field + search filter
4. [P2] Google Maps pick-up location pin (booking flow)
5. [P2] In-app messaging system
6. [P3] Admin-configurable homepage carousel & featured section
7. [P3] Complaints & feedback page (/feedback)
8. [P3] Contact Us page (/contact) — reuses feedback endpoint, must follow #7
9. [P3] Build /how-it-works and /partners pages
10. [P3] Driver dashboard

## Notes / constraints

- Google Maps tasks: GOOGLE_MAPS_API_KEY is not provisioned yet. Build all Maps
  features behind `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with graceful fallback to the
  existing free-text inputs when the key is absent.
- One task = one commit = one push (subject = backlog task title verbatim).
- If rate-limited: write session-state.md, ScheduleWakeup 14400s.

## Acceptance criteria

Per-task criteria are in docs/loop/backlog.md item descriptions.
