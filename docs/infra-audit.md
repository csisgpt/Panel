# Infra Audit — Panel (Frontend)

## ✅ What exists
- **App Router structure:** `app/(admin)`, `app/(trader)`, `app/login` with shared providers in `components/providers.tsx`.【F:components/providers.tsx†L1-L14】
- **API layer:** Simple fetch wrapper in `lib/api/client.ts` + endpoint modules under `lib/api/*` (accounts, deposits, withdrawals, files, etc.).【F:lib/api/client.ts†L1-L31】
- **Response shapes:** Most API modules expect plain arrays or DTO objects (no unified `{ data, meta }` envelope yet).【F:lib/api/files.ts†L1-L18】
- **Auth/token handling:** `panel_user_v2` + `panel_token_v2` stored in localStorage via `lib/auth-context.tsx`.【F:lib/auth-context.tsx†L21-L82】
- **Mock mode:** `API_MODE` with mock helpers in `lib/mock-data.ts` and API modules checking `isMockMode()`.【F:lib/api/config.ts†L1-L11】【F:lib/mock-data.ts†L1246-L1281】
- **File system types:** `FileMeta`, `Attachment`, `AttachmentEntityType` in `lib/types/backend.ts` (used by files + attachments APIs). AttachmentLink is not represented yet on the frontend.【F:lib/api/files.ts†L1-L18】
- **P2P settlement modules:** `lib/api/deposits.ts` + `lib/api/withdrawals.ts` exist, but no allocation-specific frontend modules yet.【F:lib/api/deposits.ts†L1-L40】【F:lib/api/withdrawals.ts†L1-L40】
- **UI foundation:** shadcn/ui components (`badge`, `dialog`, `table`, `toast`, etc.).【F:components/ui†L1-L20】

## ❌ What is missing
- **Contracts layer:** No shared list/error contracts or adapters for `{ items, meta }` vs `{ data, meta }` responses.
- **Enterprise API client:** No auth injection, timeout/retry, or normalized error typing in the fetch wrapper.
- **React Query foundation:** No query provider, query key factories, or mutation helpers.
- **QueryKit & format utilities:** No URL state utilities or shared formatting/masking helpers.
- **Ops/File/Table kits:** No reusable kits or dev playground for ops workflows.
- **Generated API types:** No OpenAPI-derived type generation or sync guidance.

## 🔧 What this PR will add (scoped)
- **Contracts + adapters:** `lib/contracts/*` with list/error helpers and normalization.
- **Upgraded API client:** Timeout + retry + auth injection + error normalization, while keeping existing exports stable.
- **React Query base:** Provider, key factories, mutation helper with toast.
- **QueryKit:** URL-first list state (pagination/sort/search/filters) via zod schemas.
- **FormatKit:** Money/date/masking helpers + clipboard utility.
- **TableKit/OpsKit/FileKit:** Reusable UI building blocks + dev playground under `app/(dev)/dev/kit-playground`.
- **OpenAPI types workflow:** Script and generated types path (frontend-side) tied to backend OpenAPI JSON.

## ⚠️ Risks & how we mitigate
- **Breaking existing API calls:** Keep `apiGet/apiPost/apiPatch` exports and add adapters for response shapes.
- **Provider collisions:** Wrap React Query provider in central `components/providers.tsx` only (no product route changes).
- **Mock mode regressions:** Preserve `API_MODE` checks in API modules and provide FileKit mock handling.

## ✅ How to test locally
1. Install deps: `yarn install`
2. Run lint: `yarn lint`
3. Run build: `yarn build`
4. Start dev server: `yarn dev`
5. Visit `/dev/kit-playground` with `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1`.

---

## Backend note
The backend repository (`Gold-nest-*`) was **not found** in this workspace, so backend audit and changes are not included here. Please provide the backend repo path to complete backend work.
