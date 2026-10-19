# Elevator

Step-by-step elevator simulation, built with [Preact](https://preactjs.com/), TypeScript and [Vite](https://vite.dev/).

Originally a Create React App project (https://gitlab.com/oleg.b.dev/elevator). It was migrated to Preact
on top of the `feature/fields-access` branch; the elevator logic in `src/Elevator`, `src/helpers` and
`src/types` is unchanged from that branch, and only the UI layer and the tooling were rewritten.

## Scripts

```sh
nvm use           # Node 22, from .nvmrc
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # type-check and build to dist/
npm run preview    # serve the production build
npm test           # elevator logic tests (Vitest), incl. golden traces
```

## Project layout

- `src/Elevator` – the elevator: storage, mover, loader, sorter
- `src/helpers` – the built-in test situations
- `src/types` – floors, persons, options
- `src/components` – Preact UI (`ElevatorManagement`, `ElevatorFloor`, `Icon`)

## Ideas and backlog

See [`to do.txt`](./to%20do.txt).

## Golden traces

`src/Elevator/__tests__/golden.json` pins the exact behavior of the elevator logic: every
rendered state, tick by tick, across the built-in situations and 300 seeded random
scenarios. Refactors must keep it passing. After an intentional behavior change,
regenerate it with `UPDATE_GOLDEN=1 npm test` and commit the new file.
