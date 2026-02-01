# Backend Contract Notes (Gold Nest)

These notes capture the backend-facing contracts that the Panel frontend consumes for the P2P admin flows, file links, and destinations. All shapes were derived from frontend API usage and contracts in this repo. Where backend behavior cannot be inferred statically, it is flagged as **runtime verification needed**.

## Conventions
- **List queries** use `limit` + `offset` (P2P) and return `{ data, meta }` with offset-based meta fields.
- **Sort** parameters are sent as `sortKey` + `sortDir`.
- **Search** uses `search` unless otherwise noted.

## Admin P2P withdrawals list
**Method:** `GET`
**Path:** `/admin/p2p/withdrawals`
**Access:** Admin / Ops (runtime verification needed)

**Query params (runtime verification needed):**
- `limit` (number)
- `offset` (number)
- `search` (string)
- `sortKey` (string)
- `sortDir` (`asc` | `desc`)
- `status` (string)
- `bucket` (string)
- `hasProof` (boolean)
- `hasDispute` (boolean)
- `expiringSoonMinutes` (number)
- `amountMin` (number)
- `amountMax` (number)

**Response shape:**
```json
{
  "data": [
    {
      "id": "p2p-w-1",
      "createdAt": "2024-05-01T10:00:00Z",
      "amount": "8000000",
      "remainingToAssign": "4000000",
      "userMobile": "09120000000",
      "status": "NEEDS_ASSIGNMENT",
      "destinationSummary": "بانک ملت - ****1234",
      "hasProof": false,
      "hasDispute": false,
      "expiresAt": "2024-05-01T12:00:00Z"
    }
  ],
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 48,
    "sort": "createdAt:desc",
    "filtersApplied": {}
  }
}
```

## P2P withdrawal candidates
**Method:** `GET`
**Path:** `/admin/p2p/withdrawals/:id/candidates`
**Access:** Admin / Ops (runtime verification needed)

**Query params:** same list params as above (`limit`, `offset`, `search`, `sortKey`, `sortDir`).

**Response shape (runtime verification needed):**
```json
{
  "data": [
    {
      "id": "cand-1",
      "name": "کاندید ۱",
      "mobile": "09120000001",
      "amount": "1500000"
    }
  ],
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 2
  }
}
```

## Assign candidates to withdrawal
**Method:** `POST`
**Path:** `/admin/p2p/withdrawals/:id/assign`
**Access:** Admin / Ops (runtime verification needed)

**Request DTO (multi-selection):**
```json
{
  "candidateIds": ["cand-1", "cand-2"]
}
```

**Response:** success envelope or empty response (runtime verification needed).

## Admin P2P allocations list
**Method:** `GET`
**Path:** `/admin/p2p/allocations`
**Access:** Admin / Ops (runtime verification needed)

**Query params:** same list params as withdrawals (`limit`, `offset`, `search`, `sortKey`, `sortDir`, plus filters like `status`, `bucket`, `hasProof`, `hasDispute`, `expiringSoonMinutes`, `amountMin`, `amountMax`).

**Response shape:**
```json
{
  "data": [
    {
      "id": "p2p-a-1",
      "createdAt": "2024-05-01T10:00:00Z",
      "status": "PROOF_SUBMITTED",
      "amount": "5000000",
      "expiresAt": "2024-05-01T12:00:00Z",
      "payerName": "پرداخت‌کننده ۱",
      "payerMobile": "09120000001",
      "receiverName": "دریافت‌کننده ۱",
      "receiverMobile": "09120000002",
      "proofFileIds": ["file-1"],
      "actions": {
        "payerCanSubmitProof": false,
        "receiverCanConfirm": false,
        "adminCanFinalize": false,
        "adminCanVerify": true,
        "adminCanCancel": true
      }
    }
  ],
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 36
  }
}
```

## Allocation admin ops
**Method:** `POST`
**Paths:**
- `/admin/p2p/allocations/:id/verify`
- `/admin/p2p/allocations/:id/finalize`
- `/admin/p2p/allocations/:id/cancel`

**Request DTO:** likely empty body or audit notes (runtime verification needed).

**Response:** updated allocation or `{ success: true }` (runtime verification needed).

## Files
**Method:** `GET`
**Path:** `/files/:id`

**Query params:**
- `mode=preview|download`

**Response shape:**
```json
{
  "id": "file-1",
  "previewUrl": "https://...",
  "downloadUrl": "https://...",
  "expiresInSeconds": 600
}
```

## Destinations
**User destinations**
- **Method:** `GET`
- **Path:** `/p2p/destinations`

**Create destination**
- **Method:** `POST`
- **Path:** `/p2p/destinations`
- **Body:** `{ label: string, iban?: string, cardNumber?: string, bankName?: string }`

**Update destination**
- **Method:** `PATCH`
- **Path:** `/p2p/destinations/:id`
- **Body:** same as create

**Set default destination**
- **Method:** `POST`
- **Path:** `/p2p/destinations/:id/make-default`
- **Body:** `{ id: string }`
- **Note:** runtime verification needed on action naming.

**Admin/system destinations**
- **Method:** `GET`
- **Path:** `/admin/p2p/destinations`

## Ops summary
**Method:** `GET`
**Path:** `/admin/p2p/ops-summary`
**Response shape:**
```json
{
  "needsAssignment": 12,
  "proofSubmitted": 8,
  "expiringSoon": 6,
  "disputes": 3
}
```

## Frontend mapping decisions
- **Offset → page meta conversion** (used in `adaptP2PMeta`):
  - `page = floor(offset / limit) + 1`
  - `totalPages = total ? ceil(total / limit) : page`
  - `hasNext = total ? page < totalPages : false`
  - `hasPrev = page > 1`
- **Allocation actions mapping**:
  - Backend action fields map to permissions:
    - `payerCanSubmitProof` → `canSubmitProof`
    - `receiverCanConfirm` → `canConfirmReceived`
    - `adminCanFinalize` → `canFinalize`
    - `adminCanVerify` → `canAdminVerify`
    - `adminCanCancel` → `canCancel`
  - **TODO:** Replace temporary status-based rules (`PROOF_SUBMITTED`, `NEEDS_VERIFY`) with explicit backend `can*` aliases when available.
