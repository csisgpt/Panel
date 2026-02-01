# PR Summary — Panel (Frontend)

## What changed
- Aligned backend contract notes with the verified Gold-nest API for P2P admin flows, destinations, files, and ops summary.
- Updated P2P API modules to use the real routes, query params, assign DTO, and VM mappers for stable frontend rows.
- Added VM adapters and ops-summary adapters to translate backend shapes into UI-ready data.
- Updated screen configs for P2P withdrawals/allocations with backend-accurate filters/sorts and mapped row fields.
- Updated destinations API + list screen to reflect PaymentDestinationViewDto.
- Enhanced the dev playground to show ops-summary counts and sample query params.

## How to validate
1. Start the dev playground: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 pnpm dev`.
2. Visit `http://localhost:3000/dev/kit-playground`.
3. Verify:
   - Withdrawals and allocations tables render with Persian chips and mapped fields.
   - Verify/Cancel buttons enable for `PROOF_SUBMITTED` / `RECEIVER_CONFIRMED` / `ADMIN_VERIFIED` statuses.
   - Ops summary counts render in the demo tabs.
   - Sample query params match the backend contract in the debug panels.

## Commands
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

## TODO (runtime verification)
- Replace rule-based admin verify/cancel permissions when backend exposes explicit admin action flags.
# خلاصه تغییرات
- اضافهشدن صفحههای ایندکس برای مسیرهای /trader و /admin که به داشبوردها ریدایرکت میشوند.
- یکسانسازی منطق خروج و حذف فراخوانی مستقیم clearSession در لایه UI.
- تجمیع منطق returnTo امن و ریدایرکتهای بعد از ورود با توجه به نقش کاربر.

# نحوه تست
- pnpm lint
- pnpm typecheck
- pnpm build
- اجرای اپ و تست دستی:
  - /login (ورود و بررسی returnTo)
  - /register (ثبتنام و بازگشت به ورود)
  - /trader (ریدایرکت به داشبورد)
  - /admin (ریدایرکت به داشبورد)
