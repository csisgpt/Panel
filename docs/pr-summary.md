# PR Summary — Panel (Frontend)

## What changed
- Added backend-aligned **error handling** (envelope parsing + traceId handling) and success envelope unwrapping.
- Introduced **adapters** for list responses, P2P meta conversion, actions mapping, and list param → query mapping.
- Added **P2P and destination API modules** with mock support, plus screen configs for P2P withdrawals/allocations and destinations.
- Added **OpenAPI sync script** and updated API types docs.
- Expanded **dev playground** with realistic mock screens using ServerTableView + screen configs.
- Added **backend contract notes** + error fixtures placeholders to align with backend expectations once verified.

## How to test locally
1. Install deps: `pnpm install`
2. Run lint: `pnpm lint`
3. Run typecheck: `pnpm typecheck`
4. Run build: `pnpm build`
5. Start dev server: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 pnpm dev`
6. Visit `http://localhost:3000/dev/kit-playground`

## Reviewer checklist
- **Error parsing**: Toggle error simulation and verify traceId copy in ErrorState.
- **P2P lists**: Tabs update URL, search and filters show chips, pagination works.
- **Allocations**: Proof preview opens gallery, action buttons respect permissions.
- **Destinations**: Masked IBAN/card and default badge render.
- **OpenAPI**: Run `pnpm sync:openapi` then `pnpm gen:api-types` when backend is running.
