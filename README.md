# Panel
## Package manager
- pnpm is the source of truth for dependencies and lockfiles.

## API حالت ماک
- متغیر `NEXT_PUBLIC_API_MODE` را می‌توان بین `mock` و `http` تغییر داد (پیش‌فرض: `mock`).
- برای اتصال به بک‌اند نِست، مقدار `NEXT_PUBLIC_API_BASE_URL` را تنظیم کنید و `API_MODE` را روی `http` بگذارید.
- انواع مشترک در `lib/types/backend.ts` تعریف شده‌اند و لایه API در `lib/api` آماده تزریق توکن و مسیرهای واقعی است.
