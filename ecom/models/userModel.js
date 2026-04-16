const { getPool } = require("../config/db");

async function findUserByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const pool = getPool();
  const [rows] = await pool.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createUser({ id, name, email, passwordHash }) {
  const pool = getPool();
  await pool.execute(
    "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
    [id, name, email, passwordHash],
  );
  return { id, name, email };
}

module.exports = { findUserByEmail, findUserById, createUser };

