# Infra Audit — Panel (Frontend)

## ✅ What exists
- **App Router structure:** `app/(admin)`, `app/(trader)`, `app/login` with shared providers in `components/providers.tsx`.【F:components/providers.tsx†L1-L14】
- **Contracts layer:** List contracts + error typing + permissions contracts and UI action state helpers. (`lib/contracts/*`).【F:lib/contracts/list.ts†L1-L26】【F:lib/contracts/errors.ts†L1-L7】【F:lib/contracts/permissions.ts†L1-L36】【F:lib/contracts/action-ui-state.ts†L1-L27】
- **API layer:** Fetch wrapper in `lib/api/client.ts` with endpoint modules under `lib/api/*` using envelope-first list APIs (with array wrappers preserved).【F:lib/api/client.ts†L1-L31】【F:lib/api/deposits.ts†L1-L36】【F:lib/api/withdrawals.ts†L1-L36】
- **React Query base:** Provider, query keys, and mutation helpers in `lib/query/*`.【F:lib/query/query-keys.ts†L1-L16】
- **QueryKit & format utilities:** URL list state + zod schemas and shared formatting helpers. (`lib/querykit/*`, `lib/format/*`).【F:lib/querykit/use-list-query-state.tsx†L1-L28】【F:lib/format/money.ts†L1-L18】
- **Ops/File/Table kits:** Reusable UI building blocks, persistence helper, and FileKit gallery improvements. (`components/kit/*`).【F:components/kit/table/data-table.tsx†L1-L88】【F:components/kit/table/use-table-state-persistence.ts†L1-L46】【F:components/kit/files/attachment-gallery-modal.tsx†L1-L141】
- **Mock mode:** `API_MODE` with mock helpers in `lib/mock-data.ts` and API modules checking `isMockMode()`.【F:lib/api/config.ts†L1-L11】【F:lib/mock-data.ts†L1177-L1314】
- **OpenAPI types workflow:** `docs/openapi.json` stub + generated types at `lib/types/generated/api.d.ts`.【F:docs/openapi.json†L1-L123】【F:lib/types/generated/api.d.ts†L1-L78】
- **Dev playground:** `/dev/kit-playground` demonstrates permissions vs UI state, TableKit with URL state, and FileKit gallery. (Requires `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1`).【F:app/(dev)/dev/kit-playground/kit-playground.tsx†L1-L216】

## ⚠️ Remaining gaps
- **Backend OpenAPI export:** Replace the stub spec in `docs/openapi.json` with the backend export and regenerate types.
- **Real backend DTO mapping:** List wrappers are ready, but DTO mapping and page wiring remain for product routes.

## ✅ How to test locally
1. Install deps: `yarn install`
2. Run lint: `yarn lint`
3. Run build: `yarn build`
4. Start dev server: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 yarn dev`
5. Visit `/dev/kit-playground` to verify permissions, table behavior, and FileKit navigation.

---

## Backend note
The backend repository (`Gold-nest-*`) was **not found** in this workspace, so backend changes are not included here.
