# Current Plan — Iteration 13

**Goal:** Azure Blob Storage adapter + active sub-nav highlighting + dispute report form
**Started:** 2026-06-29
**Milestone commit tag:** `storage-ux`

## Acceptance Criteria

- `IStorageProvider` interface with `upload()` method; `LocalDiskProvider` (dev) + `AzureBlobProvider` (prod, behind env flag)
- UsersController switches from multer diskStorage to memoryStorage, delegates to the provider
- Renter and Admin sub-navs highlight the active route using `usePathname()`
- `POST /disputes` endpoint accepts booking ID + description; stores in Dispute model
- `/booking/[id]` page has "Report an Issue" button that opens a dispute form

## Steps

1. [x] Write plan
2. [ ] Backend: IStorageProvider + LocalDiskProvider + AzureBlobProvider + factory in UsersModule
3. [ ] Backend: DisputesModule (POST /disputes, GET /disputes for admin)
4. [ ] Frontend: ActiveNavLink client component; update renter + admin layouts
5. [ ] Frontend: DisputeForm on booking confirmation page
6. [ ] Commit + push → Milestone: storage-ux
7. [ ] Update observations, backlog, clear plan

## Cutpoint

Write last completed step to session-state.md and schedule wakeup if rate limit hit.
