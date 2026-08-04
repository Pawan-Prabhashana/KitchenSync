# KitchenSync
https://kitchen-sync-eosin.vercel.app/

Real-time kitchen order management board for waiters and chefs with live synchronization, urgency timers, conflict guards, and order stage history.

## Features

- Kanban-style order board with stages (New → In Progress → Ready → Served)
- Order detail drawer, history, and undo for recent stage moves
- Add new orders via modal; assign chefs and track versions
- Multiple views: Board, Orders table, Chefs, History, Analytics, Settings
- Local persistence via `localStorage` (demo data included)

## Tech

- React + TypeScript
- Vite dev server
- Tailwind CSS

## Local development

Install dependencies and run the dev server (uses Git Bash):

```bash
npm install
npm run dev
```

Open http://localhost:3000/ in your browser.

## Build for production

```bash
npm run build
npm start
```

## Useful files

- `src/` — React source (components in `src/components`)
- `data/` — demo `INITIAL_HARDCODED_ORDERS` and `menu` data
- `index.html` — app entry point

## Contributing

PRs welcome. Please run `npm run lint` before committing.

## License

Apache-2.0# KitchenSync

Real-time kitchen order management board for waiters and chefs with live synchronization, urgency timers, conflict guards, and order-stage history.

## Features

- Visual Kanban-style board for kitchen orders
- Create, assign, move, and serve orders
- Local persistence via `localStorage` for demo purposes
- Multiple views: board, table list, chefs, history, analytics, and settings
- Undo recent stage moves

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS for styling
- Socket.IO (client/server-ready hooks)

## Quickstart

Install dependencies:

```bash
npm install
```

Run the dev server (opens at `http://localhost:3000`):

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm start
```

Available npm scripts are defined in `package.json` (e.g. `dev`, `build`, `start`, `lint`).

## Development Notes

- The demo uses a hardcoded set of demo users and initial orders located under `src/data/`.
- Orders are saved to `localStorage` under the key `kitchensync_orders_v1`.
- Components are in `src/components/` and the main app entry is `src/App.tsx`.

## Contributing

1. Fork the repository
2. Create a branch for your feature/fix
3. Open a pull request with a clear description

## License

This project does not include a license file. Add one (for example `MIT`) if you plan to publish it publicly.

---

_Generated and updated locally on your machine._
 # KitchenSync

 A lightweight, local-first kitchen order board and management UI built with React + Vite.

 ## Features

 - Kanban-style order board with stages (New → Preparing → Ready → Served)
 - Create, assign, move, undo, and delete orders
 - Multiple views: Board, Orders table, Chefs, History, Analytics, Settings
 - Local persistence via `localStorage` for quick demos

 ## Built with

 - React 19
 - Vite
 - TypeScript
 - Tailwind CSS

 ## Quickstart

 Install dependencies and run the dev server (opens at port 3000):

 ```bash
 npm install
 npm run dev
 ```

 Open http://localhost:3000/ in your browser.

 To build for production:

 ```bash
 npm run build
 npm start   # runs `vite preview` on port 3000
 ```

 ## Project structure

 - `src/` — application source
 - `src/components` — React UI components
 - `src/data` — demo data and initial orders
 - `index.html`, `vite.config.ts` — Vite entry and config

 ## Contributing

 1. Fork or clone this repository
 2. Create a branch for your feature: `git checkout -b feat/your-feature`
 3. Make changes, run the dev server, and open a pull request

 ## Notes

 - This app is intentionally local-first and uses `localStorage` for demo orders.
 - If you want a backend or real-time syncing, add an API server and replace the local persistence layer.

 ## License

 MIT
