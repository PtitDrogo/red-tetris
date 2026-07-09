**Red-Tetris**

A real-time multiplayer Tetris-battle project by tfreydie & Garivo.

**Overview**

- **Purpose:** Multiplayer competitive Tetris implemented with a React + Vite client and a Node + TypeScript server using Socket.IO.
- **Gameplay:** Real-time multiplayer matches, lobby management, and game state synchronization over WebSockets.

**Features**

- **Real-time multiplayer** via `socket.io`.
- **Lobby system** for creating/joining games.
- **Deterministic RNG** for fair piece generation (server-side).
- **Client-side UI** written in React + Redux; built with Vite.

**Tech Stack**

- **Client:** React, TypeScript, Vite, Redux, TailwindCSS, Socket.IO client.
- **Server:** Node (TypeScript), Express, Socket.IO.
- **Testing:** Vitest for both client and server.

**Prerequisites**

- Node.js (v18+ recommended)
- npm (or yarn/pnpm)

**Quick Start (development)**

1. Install dependencies at the repo root (this will also install client and server deps):

```bash
npm install
```

2. Start client and server concurrently (root script):

```bash
npm run dev
```

This runs the client dev server (Vite) and the server dev process simultaneously. By default:

- Client: http://localhost:5173
- Server: http://localhost:3000

You can also run each side separately:

- Client only:

```bash
npm run dev --prefix client
```

- Server only:

```bash
npm run dev --prefix server
```

The server accepts a `PORT` environment variable; e.g. to run on port 4000:

```bash
PORT=4000 npm run dev --prefix server
```

**Build & Production**

- Build the client:

```bash
npm run build --prefix client
```

- Build the server (TypeScript -> JS):

```bash
npm run build --prefix server
```

- Start production server:

```bash
npm run prod
```

Note: The root `prod` script attempts to build both sides and run preview and server start concurrently.

**Testing & Coverage**

- Run all tests (client + server) from repo root:

```bash
npm test
```

- Run tests for a specific side:

```bash
npm test --prefix client
npm test --prefix server
```

- Generate coverage reports:

```bash
npm run coverage
```

**Environment / Deployment notes**

- The server sets CORS for the client origins: http://localhost:5173, http://localhost:4173 and https://tetris-battles.vercel.app (see [server/src/index.ts](server/src/index.ts#L1)).
- When deploying, ensure the production client URL is added to the server's allowed origins or make CORS configuration environment-driven.

**Project Structure (important files)**

- `package.json` (root): repo-level scripts that orchestrate client & server.
- [client/package.json](client/package.json): client scripts (`dev`, `build`, `preview`, `test`).
- [server/package.json](server/package.json): server scripts (`dev`, `build`, `start`, `test`).
- [client/src/main.tsx](client/src/main.tsx#L1): client entry.
- [server/src/index.ts](server/src/index.ts#L1): server entry and Socket.IO setup.
- `shared/`: shared types/constants used by both client and server.

Top-level folders:

- `client/` — React + Vite app.
- `server/` — Node + TypeScript Socket.IO server.
- `shared/` — common constants and types.

**Running a local multiplayer match**

1. Start server and client as above.
2. Open multiple browser windows/tabs at the client URL and create/join a lobby. The server handles socket connections and game updates.

**Contributing**

- Please open issues or pull requests on the repository. When contributing, include:
    - A clear description of the change
    - Steps to reproduce (if bugfix)
    - Test coverage for new behavior when possible

**Acknowledgements**

- Built by tfreydie & Garivo. Inspired by classic multiplayer Tetris variants.

**License**

```
MIT License

Copyright (c) 2026 Theo Freydiere Roumeysi - Gabriel Rivo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
