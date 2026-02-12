# ماژول‌های پایه فرانت‌اند

## صفحات پیاده‌سازی‌شده
- `/admin/users` کاربران
- `/admin/users/[id]` جزئیات کاربر
- `/admin/kyc` صف KYC
- `/admin/customer-groups` گروه‌های مشتریان
- `/admin/customer-groups/[id]` جزئیات گروه
- `/admin/policy-rules` قوانین پالیسی
- `/admin/tahesab/outbox` صف خروجی ته‌حساب
- `/trader/dashboard` داشبورد کاربر
- `/trader/profile` پروفایل/تنظیمات/ارسال KYC

## Endpointهای استفاده‌شده
- کاربران/من: `/me/overview`, `/me/kyc`, `/me/kyc/submit`, `/me/policy/summary`, `/me/settings`
- ادمین کاربران: `/admin/meta/users`, `/admin/users`, `/admin/users/:id/overview`, `/admin/users/:id/wallet/accounts`, `/admin/users/:id`, `/admin/users/:id/kyc`, `/admin/users/:id/policy/summary`, `/admin/users/:id/effective-policy`, `/admin/users/:id/wallet/adjust`
- گروه‌ها: `/admin/customer-groups`, `/admin/customer-groups/paged`, `/admin/customer-groups/:id/settings`, `/admin/customer-groups/:id/users`, `/admin/customer-groups/:id/users:move`
- پالیسی: `/admin/policy-rules`, `/admin/policy-rules/bulk-upsert`, `/admin/users/:id/product-limits`, `/admin/users/:id/product-limits:apply`, `/admin/users/:id/limits/usage`, `/admin/users/:id/limits/reservations`, `/admin/audit/policy`
- فایل‌ها: `/files`, `/files/:id/meta`, `/files/:id`, `/admin/files`, `/admin/files/:id/meta`
- ته‌حساب: `/admin/tahesab/outbox`, `/admin/tahesab/outbox/:id/retry`, `/admin/tahesab/users/:id/resync`, `/admin/tahesab/customer-groups/:groupId/resync-users`

## نگاشت برچسب فارسی
نگاشت‌های مرکزی در `lib/i18n/fa.ts` قرار گرفته‌اند و شامل:
- نقش/وضعیت کاربر
- وضعیت/سطح KYC
- دامنه/عملیات پالیسی
- متن‌های عمومی UI (ذخیره، ثبت، حذف، ...)

## Envelope و متای لیست
- تمام فراخوانی‌ها از `lib/api/client.ts` عبور می‌کنند و unwrap روی envelope انجام می‌شود.
- خطاها به صورت typed (`ApiError`) مدیریت می‌شوند.
- برای لیست‌ها، داده‌ها با `items/meta` از پاسخ قرارداد بک‌اند گرفته می‌شوند و متا شامل page/limit/totalItems/totalPages/hasNextPage/hasPrevPage است.
