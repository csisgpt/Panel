# Backend Contract Notes (Gold Nest)

> **Note:** The backend repository was not found in this workspace. These notes are placeholders based on expected patterns and MUST be verified against the backend codebase once available. Replace the samples and endpoint details below after inspecting `src/main.ts`, exception filters, interceptors, and controllers.

## 0.1 Error Envelope (expected parsing)
Expected envelope (placeholder):
```json
{
  "ok": false,
  "error": {
    "code": "validation_failed",
    "message": "Validation failed",
    "details": { "field": "mobile" }
  },
  "traceId": "TRACE-123"
}
```

### Example payloads (placeholder)
**Validation error**
```json
{
  "ok": false,
  "error": {
    "code": "validation_failed",
    "message": "Invalid payload",
    "details": { "field": "amount", "reason": "min" }
  },
  "traceId": "TRACE-VALIDATION-01"
}
```

**Forbidden error**
```json
{
  "ok": false,
  "error": {
    "code": "forbidden",
    "message": "Access denied",
    "details": null
  },
  "traceId": "TRACE-FORBIDDEN-01"
}
```

**Not found**
```json
{
  "ok": false,
  "error": {
    "code": "not_found",
    "message": "Resource not found",
    "details": null
  },
  "traceId": "TRACE-NOTFOUND-01"
}
```

## 0.2 Optional Success Envelope
If backend supports an envelope header (e.g. `x-api-envelope: 1`), expected success shape (placeholder). Frontend can enable this via `NEXT_PUBLIC_API_ENVELOPE=1`:
```json
{
  "ok": true,
  "result": { "items": [], "meta": { "page": 1, "limit": 20, "total": 0 } },
  "traceId": "TRACE-SUCCESS-01"
}
```

## 0.3 List Response Shapes
Placeholder shapes until backend verification:
- **Classic admin lists:** `{ items: T[]; meta: PageMeta }`
- **P2P lists:** `{ data: T[]; meta: OffsetMeta }`

PageMeta (placeholder):
- `page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`, `filtersApplied`, `sort`

OffsetMeta (placeholder):
- `limit`, `offset`, `total`, `nextCursor?`, `filtersApplied`, `sort`

## 0.4 Endpoint Inventory (to verify)
| Area | Endpoint | Notes / Query params (placeholder) |
| --- | --- | --- |
| Files | `GET /files/:id` | `mode=preview|download` |
| Admin withdrawals | `GET /admin/withdrawals` | `page`, `limit`, `status`, `search`, `minAmount`, `maxAmount` |
| Admin deposits | `GET /admin/deposits` | `page`, `limit`, `status`, `search` |
| Admin P2P withdrawals | `GET /admin/p2p/withdrawals` | `limit`, `offset`, `status`, `expiringSoonMinutes`, `hasProof`, `hasDispute` |
| Candidates | `GET /admin/p2p/withdrawals/:id/candidates` | `limit`, `offset` |
| Assign | `POST /admin/p2p/withdrawals/:id/assign` | body includes candidate id(s) |
| Admin P2P allocations | `GET /admin/p2p/allocations` | `limit`, `offset`, `status`, `expiringSoonMinutes` |
| Allocation ops | `POST /admin/p2p/allocations/:id/verify|finalize|cancel` | action endpoints |
| Ops summary | `GET /admin/p2p/ops-summary` | counts by bucket |
| Destinations | `GET/POST/PATCH /destinations` | user destinations CRUD |
| Admin destinations | `GET/POST/PATCH /admin/destinations` | system destinations CRUD |

> Replace this table with exact backend endpoints and query params after verifying the backend repository.
