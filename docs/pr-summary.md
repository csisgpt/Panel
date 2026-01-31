# PR Summary — Panel (Frontend)

## What changed
- Added **contracts + adapters** for list/error responses.
- Upgraded **API client** with auth injection, retry, timeout, and error normalization (exports preserved).
- Added **React Query** provider + query key factories + mutation helper.
- Added **QueryKit** for URL-driven list state and presets.
- Added **FormatKit** utilities (money/date/mask/clipboard).
- Added **TableKit, OpsKit, FileKit** components.
- Added **dev playground** at `/dev/kit-playground` guarded by `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1`.
- Added **OpenAPI type generation script** and generated types stub.

## How to test locally
1. Install deps: `yarn install`
2. Run lint: `yarn lint`
3. Run build: `yarn build`
4. Start dev server: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 yarn dev`
5. Visit `http://localhost:3000/dev/kit-playground`

## Notes
- The backend repository (`Gold-nest-*`) was not available in this workspace, so backend changes (contracts, OpenAPI export, file auth tests) are not included in this PR.
- To generate API types once the backend repo is available, set `OPENAPI_JSON` to the backend OpenAPI JSON path and run `yarn gen:api-types`.
