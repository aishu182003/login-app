// server.js
// Express + SQLite backend for the signup/registry app.
// Uses Node's BUILT-IN node:sqlite module (no native compiler needed)
// and bcryptjs (pure JavaScript, no native compiler needed).
// Run with: node server.js   (after `npm install`)
 
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');
 
const app = express();
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10;
 
// ---------- Database setup ----------
const db = new DatabaseSync(path.join(__dirname, 'users.db'));
 
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    birthday      TEXT NOT NULL,        -- stored as 'YYYY-MM-DD'
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
 
const insertUserStmt = db.prepare(`
  INSERT INTO users (name, birthday, password_hash, created_at)
  VALUES (?, ?, ?, datetime('now'))
`);
 
const getAllUsersStmt = db.prepare(`
  SELECT id, name, birthday, created_at FROM users ORDER BY id DESC
`);
 
const getUserByIdStmt = db.prepare(`
  SELECT id, name, birthday, created_at FROM users WHERE id = ?
`);
 
// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
 
// ---------- Validation helpers ----------
function validatePayload({ name, birthday, password }) {
  const errors = [];
 
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
 
  if (!birthday || isNaN(Date.parse(birthday))) {
    errors.push('A valid birthday is required.');
  } else if (new Date(birthday) > new Date()) {
    errors.push('Birthday cannot be in the future.');
  }
 
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }
 
  return errors;
}
 
// ---------- Routes ----------
 
// Create a new user
app.post('/api/users', async (req, res) => {
  const errors = validatePayload(req.body || {});
  if (errors.length) {
    return res.status(400).json({ error: errors.join(' ') });
  }
 
  const { name, birthday, password } = req.body;
 
  try {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const info = insertUserStmt.run(name.trim(), birthday, password_hash);
    const created = getUserByIdStmt.get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save user. Please try again.' });
  }
});
 
// List all users (never returns password hashes)
app.get('/api/users', (req, res) => {
  try {
    const users = getAllUsersStmt.all();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load users.' });
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});