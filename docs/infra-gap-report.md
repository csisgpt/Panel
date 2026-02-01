# Infra Gap Report — Panel (Frontend)

## Current state (rescan)
- **Action contracts:** `lib/contracts/actions.ts` only models UI async state (`ActionState`, `ActionFlags`) and is not permissions-driven.【F:lib/contracts/actions.ts†L1-L18】
- **TableKit:** MVP `DataTable` and `TableStates` with no server-driven meta/callbacks/persistence; `FilterBar` only renders children; `Pagination` only handles previous/next; no column utilities.【F:components/kit/table/data-table.tsx†L1-L57】【F:components/kit/table/filter-bar.tsx†L1-L5】【F:components/kit/table/pagination.tsx†L1-L20】
- **FileKit:** `useFileLinks` lacks stable cache ordering or expiry retry, gallery has no next/prev or keyboard navigation, and provider only supports batch links.【F:components/kit/files/attachment-gallery-modal.tsx†L1-L79】【F:components/kit/files/data/use-file-links.ts†L1-L28】【F:components/kit/files/data/file-links.ts†L1-L5】
- **API modules:** Most list APIs return plain arrays with no envelope-first functions (`files`, `deposits`, `withdrawals`, `accounts/transactions`).【F:lib/api/files.ts†L1-L38】【F:lib/api/deposits.ts†L1-L16】【F:lib/api/withdrawals.ts†L1-L16】【F:lib/api/accounts.ts†L1-L31】
- **OpenAPI types:** `lib/types/generated/api.d.ts` is effectively empty and `gen:api-types` requires an env var for input.【F:lib/types/generated/api.d.ts†L1-L4】【F:package.json†L1-L14】
- **Dev playground:** `app/(dev)/dev/kit-playground` showcases basic TableKit/QueryKit/OpsKit/FileKit, but not permissions vs UI state, server-driven table UX, or FileKit recovery behavior.【F:app/(dev)/dev/kit-playground/kit-playground.tsx†L1-L184】

## Gaps list
1. **Permissions vs UI state separation**: Backend-driven action permissions are conflated with UI async state.
2. **TableKit enterprise readiness**: Missing server-driven meta/callbacks, persistent column state, and reusable empty/error/loading components.
3. **FileKit resilience**: No stable cache keys, no expiry retry, no navigation/keyboard UX.
4. **Envelope-first APIs**: List endpoints lack `{ items, meta }` primary functions and mock envelopes.
5. **OpenAPI types**: No real OpenAPI input; generated types empty; missing documentation for regeneration.
6. **Docs + playground**: Missing infra gap report and phased acceptance coverage in docs; playground doesn’t demo new infra expectations.

## What this PR will change
- Add **permissions contracts** and **Action UI state** contracts + hook; keep `actions.ts` as a compatibility re-export.
- Upgrade **TableKit** with server-driven `DataTable` props, `FilterBar` with debounced search/reset, `Pagination` with page/limit, reusable `LoadingState`/`EmptyState`/`ErrorState`, persistence helper, and column builder utilities.
- Upgrade **FileKit** with stable cache ordering, expiry retry, next/prev + keyboard navigation, and a basic fit/100% toggle.
- Add **envelope-first list APIs** across files/deposits/withdrawals/accounts transactions with backward-compatible array wrappers and mock envelopes.
- Add a minimal **OpenAPI 3.0 spec** at `docs/openapi.json`, update `gen:api-types`, and document regeneration in `docs/api-types.md`.
- Update **docs** (`infra-audit`, `pr-summary`) and **dev playground** to showcase all infra kits.

## Acceptance criteria per gap
1. **Permissions vs UI state**
   - New contracts in `lib/contracts/permissions.ts` and `lib/contracts/action-ui-state.ts`.
   - `lib/contracts/actions.ts` remains backwards compatible.
   - Playground shows allowed/denied buttons + independent loading state.
2. **TableKit**
   - `DataTable` accepts `meta`, `loading`, `error`, and state/callback props.
   - Table header always renders; body shows Loading/Error/Empty states.
   - Pagination renders only when `meta` exists.
   - FilterBar supports debounced search and reset.
   - Persistence hook stores column visibility/order/pageSize in localStorage (SSR-safe).
3. **FileKit**
   - `useFileLinks` dedupes/sorts fileIds for stable cache keys.
   - Gallery supports next/prev buttons and keyboard navigation.
   - Expired link triggers a single refetch before showing error + retry.
   - Provider supports both `getLink` and `getLinks`.
4. **Envelope-first APIs**
   - List functions return `{ items, meta }` using `normalizeListResponse`.
   - Existing array-returning functions remain as wrappers.
   - Mock data provides envelope responses for list APIs.
5. **OpenAPI types**
   - `docs/openapi.json` exists and is valid.
   - `yarn gen:api-types` generates non-empty types in `lib/types/generated/api.d.ts`.
   - `docs/api-types.md` documents how to refresh from backend.
6. **Docs & playground**
   - `docs/infra-audit.md` and `docs/pr-summary.md` updated.
   - Playground demonstrates permissions vs UI state, server-driven table with URL state, and FileKit navigation + retry.

## How to test
1. `yarn lint`
2. `yarn build`
3. `yarn dev` + visit `/dev/kit-playground` with `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1`.
