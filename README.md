# KitchenSync

**Live demo:** [https://kitchensync-m1-static-skeleton-1.vercel.app/](https://kitchensync-m1-static-skeleton-1.vercel.app/)

KitchenSync is a dual-board restaurant ops UI for **dine-in kitchen** and **delivery dispatch**. Waiters, chefs, and riders can create orders, advance stages, assign staff, and review history — with conflict guards and local persistence for demos.

> Milestone 2 (M2) adds a real **Express REST API with JWT auth** and wires the
> frontend to it. Orders/deliveries are now loaded and mutated over HTTP;
> `localStorage` is demoted to an **offline cache**. The API store is in-memory
> (seeded on boot) — **it resets on process restart**; real database persistence
> is Milestone 3.

## What’s new in M2

- **Express REST API** (`server/`) with a routes → controllers → repositories
  layout and a swappable data-access layer (in-memory now, Mongoose in M3)
- **JWT auth** — real `register` / `login` / `me`, bcrypt-hashed passwords, all
  order/delivery routes protected
- **Full CRUD** for both boards under `/api/orders` and `/api/deliveries`
- **Server-authoritative optimistic concurrency** — `PATCH` takes `expectedVersion`
  and returns **409** with the current version info on a stale write, feeding the
  existing conflict-guard UI
- **Frontend wired to the API** — session restore via `/me`, offline-cache
  fallback, and the demo quick-logins now authenticate for real
- **API contract docs** — see [`docs/API.md`](docs/API.md)

## What’s new in M1

- **Dual boards** — pick Kitchen or Delivery after login; switch anytime
- **Board-aware UI** — header, sidebar, accents, and views adapt per board
- **Delivery domain** — customer, address, distance, rider, ETA, payment, order total
- **Shared conflict guard** — version / last-updated checks on both boards (with demo simulate)
- **Separate persistence** — kitchen and delivery orders saved under different `localStorage` keys
- **Auth + routing** — login / signup pages and a board picker (`#/login`, `#/signup`, `#/select-board`)

## Features

### Kitchen board
- Kanban stages: **New → Cooking → Ready → Served**
- Assign chefs, table numbers, special notes, and menu items
- Order detail drawer with stage history and undo for recent moves
- Views: Board, Orders table, Chefs, History, Analytics, Settings

### Delivery board
- Kanban stages: **Preparing → Ready for Pickup → Out for Delivery → Delivered**
- Assign riders; track ETA / lateness, payment method, and distance
- Delivery-specific detail drawer, table view, history, and analytics
- Riders view for dispatch staffing

### Shared
- Demo login / signup flow (hash-based routes)
- Urgency / timer cues on aging orders
- Conflict guard when an order was updated by someone else
- Filters, search, and “mine” view modes where applicable
- Bottom status bar for live board context

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Motion (animations)
- Lucide icons
- **Express REST API + JWT (`jsonwebtoken`) + `bcryptjs`** — run with `tsx` (M2)
- Socket.IO packages present for upcoming real-time work (not wired as the primary sync layer yet)

## Quickstart

```bash
npm install
cp .env.example .env   # optional; sets JWT_SECRET, PORT, VITE_API_URL
npm run dev:all        # runs the API (:4000) and the Vite app (:3000) together
```

Open [http://localhost:3000/](http://localhost:3000/). Prefer two terminals? Run
`npm run server` and `npm run dev` separately.

### Demo login

All seeded users share the password **`kitchen123`** — e.g. sign in with
`priya@kitchensync.com` / `kitchen123`, or use the quick-login buttons (they
authenticate against the API). Seeded chefs/waiters live in `src/data/menu.ts`
(`DEMO_USERS`), riders in `DEMO_RIDERS`.

### Backend scripts

| Script | What it does |
| --- | --- |
| `npm run server` | Start the API on `PORT` (default 4000) via `tsx` |
| `npm run server:dev` | Same, in watch mode |
| `npm run dev` | Vite frontend on port 3000 |
| `npm run dev:all` | Run the API and frontend together (`concurrently`) |

### Trigger a version conflict (409) for the demo

- **Single client:** open an order's detail drawer and click
  **“▲ Simulate conflict (demo)”**, then try to advance it.
- **Two real clients:** while an order's drawer is open, `PATCH` the same order
  from another client (or `curl`) to bump its version, then advance it in the UI —
  the API returns a genuine **409** and the conflict banner + card badge appear.
  See [`docs/API.md`](docs/API.md#example-curl) for a copy-paste example.

### Production build

```bash
npm run build
npm start   # vite preview on port 3000
```

### Lint / typecheck

```bash
npm run lint
```

## Project structure

```
src/
  App.tsx                 # routing, dual-board state, persistence
  components/             # kitchen + delivery UI
  pages/                  # Login, Signup, SelectBoard
  data/                   # demo users, menu, seed orders
  hooks/                  # conflict guard, update flash
  lib/boardConfig.ts      # stages + board accents
  types.ts                # Order, DeliveryOrder, roles, stages
```

### Backend structure (M2)

```
server/
  index.ts / app.ts       # entry + app factory (app has no listen for tests)
  config/env.ts           # env loading/validation (PORT, JWT_SECRET, …)
  middleware/             # requireAuth (JWT), errorHandler, validate
  models/                 # shared types barrel + repository INTERFACES
  repositories/memory/    # in-memory implementations, seeded from src/data
  controllers/            # auth, order, delivery, user
  routes/                 # /api routers
  utils/                  # ids, versioning (bump + history), jwt, httpError
```

Routes/controllers depend only on repository interfaces — never the store — so
Milestone 3 swaps in Mongoose by editing one file (`server/repositories/index.ts`).

### localStorage keys (now an offline cache)

Since M2, the API is the source of truth; these keys hydrate the UI instantly and
buffer in-progress work during a brief network loss.

| Key | Purpose |
| --- | --- |
| `kitchensync_token` | JWT for the current session |
| `kitchensync_user` | Cached current user (restored, then confirmed via `/me`) |
| `kitchensync_orders_kitchen_v1` | Kitchen orders cache |
| `kitchensync_orders_delivery_v1` | Delivery orders cache |
| `kitchensync_active_board_v1` | Last selected board |
| `kitchensync_orders_v1` | Legacy single-board key (migrated if present) |

## Demo notes

- The API seeds its in-memory store from `src/data/*` on boot; **state resets when
  the server process restarts** (database persistence is Milestone 3).
- Passwords are bcrypt-hashed; no secrets are committed (`JWT_SECRET` comes from
  the environment, with an insecure dev fallback + warning when unset).
- Multi-user Socket.IO real-time sync is a later milestone; the conflict guard is
  written so an `order:updated` event is a drop-in replacement for the demo trigger.

## License

Apache-2.0
