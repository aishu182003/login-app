# Signup Registry App

A signup form (Name, Birthday, Password) that saves each entry to a SQL database
and displays every user as a card, styled like a library catalog card.

## Stack
- Frontend: plain HTML / CSS / JS (`public/`)
- Backend: Node.js + Express (`server.js`)
- Database: SQLite via Node's **built-in** `node:sqlite` module — no native
  compiler, no Visual Studio Build Tools, no separate DB server required.
  Requires **Node.js 22.5 or newer**. Swap in MySQL/Postgres using `schema.sql`
  if you'd rather use a client-server DB.
- Passwords are hashed with `bcryptjs` (pure JavaScript, no native compilation)
  before being stored — never saved in plain text, and never sent back to the
  browser (cards show masked dots instead).

## Setup

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

Check your Node version first if unsure:
```bash
node -v
```
If it's below `v22.5.0`, update Node from https://nodejs.org (LTS is fine) —
older versions don't include `node:sqlite`.

## Why no `better-sqlite3` or `bcrypt`?
Those packages need to compile native C++ code on install, which requires a
C++ build toolchain (Visual Studio Build Tools on Windows, Xcode Command Line
Tools on Mac). That trips up a lot of first-time setups with cryptic `node-gyp`
errors. This version uses Node's built-in `node:sqlite` and the pure-JS
`bcryptjs` package instead, so `npm install` only ever installs plain
JavaScript — no compiler needed, works the same on Windows/Mac/Linux.

## How it works
1. Fill in Name, Birthday, and Password and submit.
2. The browser sends a `POST /api/users` request with that data.
3. The server validates it, hashes the password, and inserts a row into the
   `users` table in `users.db` (created automatically on first run).
4. The page then calls `GET /api/users`, which returns every saved user
   (id, name, birthday, joined date — no password hash), and renders each as
   a card, newest first.
5. Refreshing the page reloads all cards from the database, so data persists
   across restarts.

## Files
```
login-app/
├── public/
│   ├── index.html   form + cards markup
│   ├── style.css    card-catalog styling
│   └── script.js    validation, fetch calls, card rendering
├── server.js        Express API + SQLite setup (node:sqlite)
├── schema.sql        reference schema for MySQL/PostgreSQL
├── package.json
└── README.md
```

## Extending it
- Add a login/authentication route with `bcrypt.compare()` against `password_hash`.
- Add a DELETE /api/users/:id route + a delete button on each card.
- Swap `node:sqlite` for `mysql2` or `pg` using `schema.sql` as the table
  definition — only the DB layer in `server.js` needs to change; the API
  shape stays the same.
