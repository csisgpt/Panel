# PR Summary — Panel (Frontend)

## What changed
- Added **permissions contracts** and **Action UI state** helpers (with backward-compatible `actions.ts`).
- Upgraded **TableKit** with server-driven `DataTable`, debounced `FilterBar`, meta-aware pagination, and state persistence.
- Upgraded **FileKit** with stable cache keys, expiry retry, and gallery navigation/keyboard controls.
- Added **envelope-first list APIs** for deposits, withdrawals, files, and account transactions (array wrappers preserved).
- Added **OpenAPI stub** + **non-empty generated types** and documentation for regeneration.
- Expanded **dev playground** to demo permissions vs UI state, TableKit URL state, and FileKit navigation.

## How to test locally
1. Install deps: `yarn install`
2. Run lint: `yarn lint`
3. Run build: `yarn build`
4. Start dev server: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 yarn dev`
5. Visit `http://localhost:3000/dev/kit-playground`

## Reviewer checklist
- **Permissions vs UI state**: In the playground, click “ارسال رسید” to see loading status without changing permissions.
- **TableKit**: Verify search and pagination update the URL, limit persists on refresh, and column visibility persists.
- **FileKit**: Open the gallery, use next/prev + arrow keys, and confirm link refresh after the first preview error.
- **API types**: Confirm `lib/types/generated/api.d.ts` is non-empty.

## Notes
- The backend repository (`Gold-nest-*`) was not available in this workspace, so backend changes are not included.
- Replace `docs/openapi.json` with the backend export when available, then run `yarn gen:api-types`.
