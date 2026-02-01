# PR Summary — Panel (Frontend)

## What changed
- Rewrote **backend contract notes** with concrete P2P admin, destinations, file-link, and ops-summary endpoints plus frontend mapping decisions.
- Updated **P2P adapters + APIs**: allocation action mapping, assign payload normalization, and mock assign validation.
- Added **Persian filter chip labels** for P2P withdrawals/allocations and updated the dev playground with ops-summary counts and clearer admin P2P demos.
- Aligned **destinations API routes** with documented backend paths and left inline TODOs where naming needs runtime verification.

## How to test locally
1. Install deps: `pnpm install`
2. Run lint: `pnpm lint`
3. Run typecheck: `pnpm typecheck`
4. Run build: `pnpm build`
5. Start dev server: `NEXT_PUBLIC_ENABLE_DEV_PLAYGROUND=1 pnpm dev`
6. Visit `http://localhost:3000/dev/kit-playground`

## Reviewer checklist
- **Docs**: Verify backend-contract-notes reflect the endpoints in use and call out runtime verification explicitly.
- **P2P lists**: Tabs update URL, filters show Persian chips, pagination works.
- **Allocations**: Proof preview opens gallery; verify/cancel buttons enable for actionable statuses in mock mode.
- **Ops summary**: Quick tab counts render in the dev playground.
- **OpenAPI**: Run `pnpm sync:openapi` then `pnpm gen:api-types` when backend is running (requires backend up).
