# PR Summary — Panel (Frontend)

## What changed
- Added **ServerTableView**: a unified wrapper for QueryKit + React Query + TableKit with QuickTabs, persistence, filters, and applied-filters chips.
- Standardized **QueryKit list params** (page/limit/search/sort/filters/tab) with parse/serialize helpers and default cleaning.
- Introduced **QuickTabs** and small TableKit enhancements (retry support, pagination control flags, disabled states).
- Expanded the **dev playground** with a ServerTableView demo including tabs, error simulation, and URL-driven state.

## How to test locally
1. Install deps: `yarn install`
2. Run lint: `yarn lint`
3. Run build: `yarn build`
4. Start dev server: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 yarn dev`
5. Visit `http://localhost:3000/dev/kit-playground`

## Reviewer checklist
- **ServerTableView**: Verify URL state updates for page/limit/search/sort/tab.
- **QuickTabs**: Switching tabs resets page and updates URL.
- **Persistence**: Toggle column visibility and refresh; state should persist.
- **Reset**: Reset clears filters/search/sort and restores default tab.
- **Error**: Enable “شبیه‌سازی خطا”, confirm retry clears once disabled.
