# Backend Contract Notes (Gold-nest)

Source of truth: **Verified backend contract** provided in the task prompt.

## Global API Envelope
- Success responses are always wrapped:
  ```json
  { "ok": true, "result": "<payload>", "traceId": "string", "ts": "ISO8601" }
  ```
- Error responses are always wrapped:
  ```json
  {
    "ok": false,
    "result": null,
    "error": { "code": "string", "message": "string", "details": [] },
    "traceId": "string",
    "ts": "ISO8601"
  }
  ```

## P2P Admin Withdrawals
**Method:** `GET`  
**Path:** `/admin/p2p/withdrawals`

**Query**
- `page` (int, default 1)
- `limit` (int, default 20, max 100)
- `offset` (int, optional; overrides page/limit if present; **deprecated** — frontend maps offset → page)
- `sort` enum:
  - `createdAt_desc` | `createdAt_asc`
  - `amount_desc` | `amount_asc`
  - `remainingToAssign_desc` | `remainingToAssign_asc`
  - `priority` (default)
  - `nearestExpire_asc`
- `status` (comma-separated string list)
- `userId`
- `mobile`
- `amountMin`, `amountMax` (integer string)
- `remainingToAssignMin`, `remainingToAssignMax` (integer string)
- `createdFrom`, `createdTo` (ISO 8601)
- `destinationBank`
- `destinationType` enum: `IBAN` | `CARD` | `ACCOUNT`
- `hasDispute` (boolean)
- `hasProof` (boolean)
- `expiringSoonMinutes` (number string)

**Response (enveloped)**
```json
{
  "ok": true,
  "result": {
    "items": [WithdrawalVmDto],
    "meta": {
      "page": 1,
      "limit": 20,
      "totalItems": 0,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false,
      "sort": "priority",
      "filtersApplied": {}
    }
  },
  "traceId": "TRACE-ID",
  "ts": "2024-01-01T00:00:00Z"
}
```

**WithdrawalVmDto**
```json
{
  "id": "",
  "purpose": "",
  "channel": null,
  "amount": "0",
  "status": "",
  "totals": {
    "assigned": "0",
    "settled": "0",
    "remainingToAssign": "0",
    "remainingToSettle": "0"
  },
  "destination": {
    "type": "IBAN",
    "masked": "IR**",
    "bankName": "",
    "title": ""
  },
  "flags": {
    "hasDispute": false,
    "hasProof": false,
    "hasExpiringAllocations": false,
    "isUrgent": false
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "actions": {
    "canCancel": false,
    "canAssign": false,
    "canViewAllocations": false
  }
}
```

## P2P Withdrawal Candidates
**Method:** `GET`  
**Path:** `/admin/p2p/withdrawals/:id/candidates`

**Query**
- `page`, `limit`
- `sort` enum: `remaining_desc` (default) | `createdAt_asc` | `createdAt_desc`
- `status` (comma-separated)
- `userId`
- `mobile`
- `remainingMin` (integer string)
- `createdFrom`, `createdTo` (ISO 8601)
- `excludeUserId`

**Response (enveloped)**
```json
{
  "ok": true,
  "result": {
    "items": [DepositVmDto],
    "meta": {
      "page": 1,
      "limit": 20,
      "totalItems": 0,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "traceId": "TRACE-ID",
  "ts": "2024-01-01T00:00:00Z"
}
```

**DepositVmDto**
```json
{
  "id": "",
  "purpose": "",
  "requestedAmount": "0",
  "status": "",
  "totals": {
    "assigned": "0",
    "settled": "0",
    "remaining": "0"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "actions": {
    "canCancel": false,
    "canBeAssigned": false
  },
  "flags": {
    "isFullyAvailable": false,
    "isExpiring": false
  }
}
```

## Assign Allocations
**Method:** `POST`  
**Path:** `/admin/p2p/withdrawals/:id/assign`

**Headers**: `Idempotency-Key` (optional)

**Body**
```json
{
  "items": [
    { "depositId": "", "amount": "100000" }
  ]
}
```

**Response**: `AllocationVmDto[]`

## P2P Admin Allocations
**Method:** `GET`  
**Path:** `/admin/p2p/allocations`

**Query**
- `page`, `limit`
- `sort` enum: `createdAt_desc` (default) | `expiresAt_asc` | `paidAt_desc` | `amount_desc`
- `status` (comma-separated)
- `withdrawalId`, `depositId`, `payerUserId`, `receiverUserId`
- `method` enum: `CARD_TO_CARD` | `SATNA` | `PAYA` | `TRANSFER` | `UNKNOWN`
- `hasProof` (boolean)
- `receiverConfirmed` (boolean)
- `adminVerified` (boolean)
- `expired` (boolean)
- `expiresSoonMinutes` (number string)
- `bankRef`
- `bankRefSearch`
- `createdFrom`, `createdTo` (ISO 8601)
- `paidFrom`, `paidTo` (ISO 8601)

**Response (enveloped)**
```json
{
  "ok": true,
  "result": {
    "items": [AllocationVmDto],
    "meta": {
      "page": 1,
      "limit": 20,
      "totalItems": 0,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "traceId": "TRACE-ID",
  "ts": "2024-01-01T00:00:00Z"
}
```

**AllocationVmDto**
```json
{
  "id": "",
  "withdrawalId": "",
  "depositId": "",
  "payer": { "userId": "", "mobile": "", "displayName": "" },
  "receiver": { "userId": "", "mobile": "", "displayName": "" },
  "amount": "0",
  "status": "ASSIGNED",
  "expiresAt": "2024-01-01T00:00:00Z",
  "paymentCode": "",
  "payment": { "method": "TRANSFER", "bankRef": "", "paidAt": "" },
  "attachments": [
    {
      "id": "",
      "kind": "proof",
      "file": { "id": "", "name": "", "mime": "", "size": 0 },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "destinationToPay": {
    "type": "IBAN",
    "bankName": "",
    "ownerName": "",
    "title": "",
    "fullValue": "",
    "masked": ""
  },
  "expiresInSeconds": 0,
  "destinationCopyText": "",
  "timestamps": {
    "proofSubmittedAt": "",
    "receiverConfirmedAt": "",
    "adminVerifiedAt": "",
    "settledAt": ""
  },
  "flags": {
    "isExpired": false,
    "expiresSoon": false,
    "hasProof": false,
    "isFinalizable": false
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "actions": {
    "payerCanSubmitProof": false,
    "receiverCanConfirm": false,
    "adminCanFinalize": false
  }
}
```

**Allocation status enum**
`ASSIGNED` | `PROOF_SUBMITTED` | `RECEIVER_CONFIRMED` | `ADMIN_VERIFIED` | `SETTLED` | `DISPUTED` | `CANCELLED` | `EXPIRED`

## Admin Allocation Actions
- `POST /admin/p2p/allocations/:id/verify`  
  Body: `{ approved: boolean, note?: string }`
- `POST /admin/p2p/allocations/:id/finalize`
- `POST /admin/p2p/allocations/:id/cancel`

Responses: `AllocationVmDto`

## Ops Summary
**Method:** `GET`  
**Path:** `/admin/p2p/ops-summary`

**Response**
```json
{
  "withdrawalsWaitingAssignmentCount": 0,
  "withdrawalsPartiallyAssignedCount": 0,
  "allocationsExpiringSoonCount": 0,
  "allocationsProofSubmittedCount": 0,
  "allocationsDisputedCount": 0,
  "allocationsFinalizableCount": 0
}
```

## User Allocations
- `GET /p2p/allocations/my-as-payer` (query: page, limit, status, expiresSoon, sort)
- `GET /p2p/allocations/my-as-receiver` (query: page, limit, status, expiresSoon, sort)
- `POST /p2p/allocations/:id/proof`  
  Body: `{ bankRef: string, method: PaymentMethod, paidAt?: ISO8601, fileIds: string[] }`
- `POST /p2p/allocations/:id/receiver-confirm`  
  Body: `{ confirmed: boolean, reason?: string }`

## Payment Destinations
- `GET /me/payout-destinations` → `PaymentDestinationViewDto[]`
- `POST /me/payout-destinations` → `PaymentDestinationViewDto`
- `PATCH /me/payout-destinations/:id` → `PaymentDestinationViewDto`
- `POST /me/payout-destinations/:id/make-default` → `PaymentDestinationViewDto`

- `GET /admin/destinations?direction=PAYOUT|COLLECTION` → `PaymentDestinationViewDto[]`
- `POST /admin/destinations/system` → `PaymentDestinationViewDto`

**PaymentDestinationViewDto**
```json
{
  "id": "",
  "type": "IBAN",
  "maskedValue": "",
  "bankName": "",
  "ownerNameMasked": "",
  "title": "",
  "isDefault": false,
  "status": "ACTIVE",
  "lastUsedAt": ""
}
```

## Files
- `POST /files` (multipart: file + optional label)
- `GET /files/:id` → `FileDownloadLinkDto`
- `GET /files/:id/raw?disposition=inline|attachment` → binary
- `GET /files/:id/meta` → metadata (admin sees more)

**FileDownloadLinkDto**
```json
{
  "id": "",
  "name": "",
  "mimeType": "",
  "sizeBytes": 0,
  "label": "",
  "method": "presigned",
  "previewUrl": "",
  "downloadUrl": "",
  "url": "",
  "expiresInSeconds": 0
}
```

## Frontend mapping decisions
- **P2P meta conversion:** uses `adaptP2PMeta` to convert offset-based meta to `page/limit/total`.
  - `page = floor(offset / limit) + 1`
  - `totalPages = total ? ceil(total / limit) : page`
  - `hasNext = total ? page < totalPages : false`
  - `hasPrev = page > 1`
- **Allocation actions:** backend flags are mapped to frontend permissions. Admin verify/cancel are rule-based for now:
  - `canAdminVerify` when status is `PROOF_SUBMITTED` or `RECEIVER_CONFIRMED`
  - `canAdminCancel` when status in `ASSIGNED | PROOF_SUBMITTED | RECEIVER_CONFIRMED | ADMIN_VERIFIED` and not terminal `SETTLED | CANCELLED | EXPIRED`
  - **TODO:** replace rule-based flags if backend adds explicit admin action flags.
- **Assign compatibility:** legacy `{ candidateId }` payloads cannot be mapped without an amount; frontend throws a validation error if amount is missing.
