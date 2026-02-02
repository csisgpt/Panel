# PR Summary — Panel (Frontend)

## What changed
- Added Phase 2 trader flows (dashboard, requests hub, destinations, withdrawals/deposits wizards, P2P payer/receiver, history) with Stepper + Sheet patterns.
- Added admin P2P ops dashboard, withdrawals queue with manual assignment drawer, and allocations list with verify/finalize flows.
- Implemented file upload support, enhanced attachment gallery (swipe + zoom), expanded P2P status/type contracts, and aligned withdrawal to use `payoutDestinationId`.
- Removed userId from deposit/withdraw requests (token-based), added P2P feature flags, and extended deposit wizard with refNo + optional files.

## New routes
### Trader
- `/trader/dashboard`
- `/trader/requests`
- `/trader/destinations`
- `/trader/withdrawals/new`
- `/trader/deposits/new`
- `/trader/p2p/payer`
- `/trader/p2p/receiver`
- `/trader/history`

### Admin
- `/admin/p2p/ops`
- `/admin/p2p/withdrawals`
- `/admin/p2p/allocations`

## Endpoints used
### User
- `GET /deposits/my`
- `POST /deposits`
- `GET /withdrawals/my`
- `POST /withdrawals`
- `GET /me/payout-destinations`
- `POST /me/payout-destinations`
- `PATCH /me/payout-destinations/:id`
- `POST /me/payout-destinations/:id/make-default`

### P2P User
- `GET /p2p/allocations/my-as-payer`
- `POST /p2p/allocations/:id/proof`
- `GET /p2p/allocations/my-as-receiver`
- `POST /p2p/allocations/:id/receiver-confirm`

### Files
- `POST /files`
- `GET /files/:id`
- `GET /files/:id/raw`

### Admin P2P
- `GET /admin/p2p/withdrawals`
- `GET /admin/p2p/withdrawals/:id/candidates`
- `POST /admin/p2p/withdrawals/:id/assign`
- `GET /admin/p2p/allocations`
- `POST /admin/p2p/allocations/:id/verify`
- `POST /admin/p2p/allocations/:id/finalize`
- `GET /admin/p2p/ops-summary`

## Manual test plan (end-to-end)
1. **Trader**
   - Add a destination: `/trader/destinations` → "افزودن مقصد".
   - Create withdrawal: `/trader/withdrawals/new` → select destination → submit.
   - Create deposit: `/trader/deposits/new` → choose method → submit.
   - P2P payer: `/trader/p2p/payer` → "ثبت پرداخت" → upload proof.
   - P2P receiver: `/trader/p2p/receiver` → "تایید دریافت" یا "اعتراض".
2. **Admin**
   - Ops dashboard: `/admin/p2p/ops` → review KPIs.
   - Withdrawals queue: `/admin/p2p/withdrawals` → "تخصیص" → assign candidates.
   - Allocations: `/admin/p2p/allocations` → "بررسی" → "نهایی‌سازی".

## Commands
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- اجرای اپ و تست دستی:
  - /login (ورود و بررسی returnTo)
  - /register (ثبتنام و بازگشت به ورود)
  - /trader (ریدایرکت به داشبورد)
  - /admin (ریدایرکت به داشبورد)
