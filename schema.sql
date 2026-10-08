-- schema.sql
-- The Node server creates this table automatically in SQLite (users.db).
-- Use this file instead if you'd rather run the app against MySQL or PostgreSQL.

-- ===== MySQL =====
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  birthday      DATE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PostgreSQL =====
-- CREATE TABLE IF NOT EXISTS users (
--   id            SERIAL PRIMARY KEY,
--   name          VARCHAR(255) NOT NULL,
--   birthday      DATE NOT NULL,
--   password_hash VARCHAR(255) NOT NULL,
--   created_at    TIMESTAMP NOT NULL DEFAULT NOW()
-- );

-- Notes:
-- 1. Never store plain-text passwords. The Node server hashes passwords with
--    bcrypt before insert; if you swap in MySQL/Postgres, keep that hashing step
--    (e.g. mysql2 + bcrypt, or pg + bcrypt) rather than storing raw passwords.
-- 2. The API only ever SELECTs id, name, birthday, created_at for display —
--    password_hash is never sent back to the browser.
