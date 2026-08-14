# KitchenSync REST API (Milestone 2)

Express + JWT backend for the dual-board (Kitchen + Delivery) order system.
All payloads correspond to the shared TypeScript types in
[`src/types.ts`](../src/types.ts) — the backend re-exports these exact types via
`server/models/types.ts`, so the client and server can never drift.

- **Base URL:** `http://localhost:4000` (configurable via `VITE_API_URL` on the
  client, `PORT` on the server)
- **Content type:** `application/json`
- **Data store:** in-memory, seeded from `src/data/*` on boot. State resets on
  process restart — real persistence is Milestone 3 (Mongoose slots in behind the
  same repository interfaces).

---

## Authentication

Auth uses JWTs (HS256). Passwords are hashed with `bcryptjs`. Seeded demo users
(from `DEMO_USERS` + `DEMO_RIDERS`) all share the password **`kitchen123`**.

1. Obtain a token from `POST /api/auth/register` or `POST /api/auth/login`. Both
   return `AuthResponse`:
   ```ts
   interface AuthResponse { token: string; user: User }
   ```
2. Send it on every protected request:
   ```
   Authorization: Bearer <token>
   ```

Everything under `/api` requires a valid token **except** `POST /api/auth/register`,
`POST /api/auth/login`, and `GET /api/health`. Missing/invalid tokens return `401`.

### `POST /api/auth/register`
Public. Creates a user and returns a token.

- Body: `{ name: string, email: string, password: string, role: Role, avatar?: string }`
  where `Role = 'waiter' | 'chef' | 'admin' | 'rider'`.
- `201` → `AuthResponse`
- `400` invalid role / missing fields · `409` `EMAIL_TAKEN`

### `POST /api/auth/login`
Public.

- Body: `{ email: string, password: string }`
- `200` → `AuthResponse`
- `401` `UNAUTHORIZED` on bad credentials

### `GET /api/auth/me`
Protected. Returns the current user from the token.

- `200` → `{ user: User }`
- `401` if token missing/invalid/expired

---

## Health

### `GET /api/health`
Public. `200` → `{ "status": "ok" }`

---

## Users

### `GET /api/users`
Protected. Staff list for chef/rider assignment dropdowns (never includes
password hashes).

- `200` → `User[]`

### `GET /api/users/:id`
Protected. `200` → `User` · `404` if not found.

---

## Kitchen orders (`Order`)

> **Order ids contain a leading `#`** (e.g. `#ORD-1042`), which is a URL fragment
> delimiter. Always `encodeURIComponent` the id in the path (`%23ORD-1042`). The
> frontend `src/lib/api.ts` does this automatically.

### `GET /api/orders`
Protected. `200` → `Order[]`

### `GET /api/orders/:id`
Protected. `200` → `Order` · `404` `NOT_FOUND`

### `POST /api/orders`
Protected. Creates a kitchen order. The server sets `id`, timestamps,
`stage: 'New'`, `version: 1`, and the initial history entry.

- Body: `{ tableNumber: string, items: OrderItem[], specialNotes?: string, waiterName?: string, chefName?: string }`
  (`waiterName` defaults to the authenticated user's name.)
- `201` → `Order` · `400` if no items / missing `tableNumber`

### `PATCH /api/orders/:id`
Protected. Move stage and/or assign chef. On success the server bumps `version`,
stamps `lastUpdatedBy`/`lastUpdatedAt`, and appends a history entry when the stage
changes.

- Body: `{ stage?: Stage, chef?: string, expectedVersion?: number }`
  where `Stage = 'New' | 'Cooking' | 'Ready' | 'Served'`. Moving to `Served` also
  stamps `servedAt`/`servedAtTimestamp`.
- `200` → updated `Order`
- `400` invalid/empty patch · `404` `NOT_FOUND` · **`409` `VERSION_CONFLICT`** (see
  [Concurrency](#concurrency--409-conflicts))

### `DELETE /api/orders/:id`
Protected. `204` · `404` `NOT_FOUND`

---

## Delivery orders (`DeliveryOrder`)

Same shape of endpoints under `/api/deliveries` (ids like `#DEL-2042`, also
`encodeURIComponent`-ed).

### `GET /api/deliveries` · `GET /api/deliveries/:id`
Protected. `DeliveryOrder[]` / `DeliveryOrder`.

### `POST /api/deliveries`
Protected. Server sets `id`, timestamps, `stage: 'Preparing'`, `version: 1`,
initial history. `etaMinutes` is derived from `distanceKm` when omitted.

- Body: `{ customerName: string, address: string, distanceKm: number, items: OrderItem[], paymentMethod: PaymentMethod, orderTotal?: number, etaMinutes?: number, specialNotes?: string, riderName?: string }`
  where `PaymentMethod = 'Cash' | 'Card' | 'Online'`.
- `201` → `DeliveryOrder` · `400` invalid payment / no items / missing fields

### `PATCH /api/deliveries/:id`
Protected. Move stage and/or assign rider. Same versioning + `expectedVersion`
concurrency rules as kitchen orders. Moving to `Delivered` stamps
`deliveredAt`/`deliveredAtTimestamp`.

- Body: `{ stage?: DeliveryStage, rider?: string, expectedVersion?: number }`
  where `DeliveryStage = 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Delivered'`.
- `200` / `400` / `404` / `409`

### `DELETE /api/deliveries/:id`
Protected. `204` · `404`

---

## Concurrency & 409 conflicts

The frontend `useConflictGuard` does optimistic concurrency via the `version`
field; the server is the authority. `PATCH` accepts an optional `expectedVersion`.
If it's provided and does **not** match the stored version, the server rejects the
write with `409` **without applying it**, returning the current server state so the
client can surface "just updated by X" instead of silently overwriting:

```json
{
  "error": { "message": "This record was updated by someone else", "code": "VERSION_CONFLICT" },
  "current": { "version": 3, "lastUpdatedBy": "Nuwan Perera", "lastUpdatedAt": "09:43 PM" }
}
```

The client feeds `current` into the existing conflict-guard UI (drawer banner +
"⚠ Updated by {name}" card badge). Two paths produce this:

1. **Demo (single client):** the drawer's **"▲ Simulate conflict (demo)"** button
   mutates the open order locally as a teammate, so the next action trips the guard.
2. **Real (multiple clients):** a second client/`curl` PATCHes the same order,
   bumping the server version; the first client's next PATCH then returns a genuine
   `409` and the same UI appears. Swapping the demo trigger for a Socket.io
   `order:updated` event later is a drop-in change.

---

## Error shape

All errors use:

```json
{ "error": { "message": "<human readable>", "code": "<MACHINE_CODE>" } }
```

`409` conflicts additionally include a top-level `current` object (above).

| Status | Codes | Meaning |
|--------|-------|---------|
| 400 | `VALIDATION_ERROR` | Missing/invalid body |
| 401 | `UNAUTHORIZED` | Missing/invalid/expired token or bad credentials |
| 404 | `NOT_FOUND`, `ROUTE_NOT_FOUND` | Resource/route not found |
| 409 | `VERSION_CONFLICT`, `EMAIL_TAKEN` | Stale write / duplicate email |
| 500 | `INTERNAL_ERROR` | Unhandled server error |

---

## Example curl

```bash
BASE=http://localhost:4000

# 1) Login (demo password) → capture the token
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"priya@kitchensync.com","password":"kitchen123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

# 2) Create a kitchen order
curl -s -X POST $BASE/api/orders \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"tableNumber":"Table 09","items":[{"id":"m1","name":"Chicken Fried Rice","quantity":2}]}'

# 3) Move a stage (note %23 == '#'). Bumps version 1 → 2.
curl -s -X PATCH "$BASE/api/orders/%23ORD-1001" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"stage":"Cooking","expectedVersion":1}'

# 4) Trigger a 409: replay the same stale expectedVersion
curl -i -X PATCH "$BASE/api/orders/%23ORD-1001" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"stage":"Ready","expectedVersion":1}'
# → HTTP/1.1 409 Conflict + { "error": {...}, "current": {...} }
```
