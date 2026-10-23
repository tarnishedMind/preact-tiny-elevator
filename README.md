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
npm run server     # people server at ws://localhost:3001/ws
npm run dev:all    # both at once
npm run build      # type-check and build to dist/
npm run preview    # serve the production build
npm test           # elevator logic tests (Vitest), incl. golden traces
```

## Project layout

- `src/Elevator` – the elevator: storage, mover, loader, sorter
- `src/helpers` – the built-in test situations
- `src/types` – floors, persons, options
- `src/components` – Preact UI (`ElevatorManagement`, `ElevatorFloor`, `TrafficControls`, `Icon`)
- `src/hooks` – `usePeopleFeed`, the client side of the people server
- `src/shared` – socket protocol and the seeded traffic generator, used by client and server
- `server` – Node WebSocket server that generates people and pushes them to the client

## People server

`npm run server` starts a WebSocket server that generates people for the
elevator. The client connects through the Vite proxy at `/ws`; the dot next to
"Server traffic" turns green when it is connected. Traffic starts paused: press
"Start traffic", then pick a pattern (`random`, `morning` from the lobby up,
`evening` back to the lobby, `lunch` both ways), a rate in people per minute,
and a seed. The same seed and pattern always give the same people. Without the
server the app works as before.

Protocol (`src/shared/protocol.ts`), JSON over the socket:

- client → server: `hello {floorCount, starterFloor}`, `config {pattern, ratePerMin, seed}`, `pause`, `resume`
- server → client: `person {id, from, to}`, `status {config, running}`

## Ideas and backlog

See [`to do.txt`](./to%20do.txt).

## Golden traces

`src/Elevator/__tests__/golden.json` pins the exact behavior of the elevator logic: every
rendered state, tick by tick, across the built-in situations and 300 seeded random
scenarios. Refactors must keep it passing. After an intentional behavior change,
regenerate it with `UPDATE_GOLDEN=1 npm test` and commit the new file.
