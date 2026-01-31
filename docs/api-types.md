# API Types Generation

This project generates TypeScript types from an OpenAPI 3.x document using `openapi-typescript`.

## Current setup
- **Source spec:** `docs/openapi.json` (temporary stub to keep generated types non-empty).
- **Output file:** `lib/types/generated/api.d.ts`.

> Replace `docs/openapi.json` with the backend export once available.

## Regenerating types
```bash
yarn gen:api-types
```

### Using a backend export
If you have a backend export at a custom path, set `OPENAPI_JSON`:
```bash
OPENAPI_JSON=/path/to/openapi.json yarn gen:api-types
```

## Notes
- This stub is intentionally minimal and must be replaced with the real backend schema.
- Ensure the generated file is committed after regeneration.
