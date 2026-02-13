# راهنمای فرانت‌اند ماژول‌های Foundation

## صفحات پیاده‌سازی‌شده
- `/admin/users`
- `/admin/users/[id]`
- `/admin/kyc`
- `/admin/customer-groups`
- `/admin/customer-groups/[id]`
- `/admin/policy-rules`
- `/admin/tahesab/outbox`
- `/trader/dashboard`
- `/trader/profile`

## Endpointهای دقیق استفاده‌شده
- کاربر: `/me/overview`, `/me/kyc`, `/me/kyc/submit`, `/me/policy/summary`
- تنظیمات کاربر: `GET/PUT /users/me/settings`
- تنظیمات ادمین: `GET/PUT /admin/users/:userId/settings`, `GET /admin/users/:userId/effective-settings`
- کاربران ادمین: `/admin/meta/users`, `/admin/users`, `/admin/users/:id/overview`, `/admin/users/:id/wallet/accounts`, `/admin/users/:id`, `/admin/users/:id/policy/summary`, `/admin/users/:id/kyc`, `/admin/users/:id/wallet/adjust`
- گروه‌ها: `/admin/customer-groups`, `/admin/customer-groups/paged`, `/admin/customer-groups/:id`, `/admin/customer-groups/:id/settings`, `/admin/customer-groups/:id/users`, `/admin/customer-groups/:id/users:move`
- پالیسی: `/admin/policy-rules`, `/admin/policy-rules/:id`, `/admin/policy-rules/bulk-upsert`, `/admin/users/:id/effective-policy`, `/admin/users/:id/product-limits`, `/admin/users/:id/product-limits:apply`, `/admin/users/:id/limits/usage`, `/admin/users/:id/limits/reservations`, `/admin/audit/policy`
- ته‌حساب: `/admin/tahesab/outbox`, `/admin/tahesab/outbox/:id/retry`, `/admin/tahesab/users/:id/resync`, `/admin/tahesab/customer-groups/:groupId/resync-users`

## شکل DTOهای کلیدی
- WalletAccountDto:
  - `instrument: {id, code, name, type}`
  - `balance/blockedBalance/minBalance/availableBalance: string|null`
  - `balancesHidden: boolean`
- WalletSummary:
  - `balancesHiddenByUserSetting: boolean`
  - `irrAvailable: string|null`
- PolicySummary:
  - `withdrawIrr/tradeBuyNotionalIrr/tradeSellNotionalIrr` هرکدام شامل `daily/monthly`
  - هر `PolicySummaryItem`: `limit`, `kycRequiredLevel`, `ruleId`, `source`
- UserSettings:
  - کلیدهای بولی + `maxOpenTrades:number|null` + `metaJson`

## قوانین تقدم
- تنظیمات موثر: `USER > GROUP > DEFAULT`
- پالیسی موثر: `USER > GROUP > GLOBAL`
- اولویت Selector در تحلیل: `PRODUCT > INSTRUMENT > TYPE > ALL`
