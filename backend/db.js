import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ---------- INIT TABLE ---------- */
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      token TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      assigned_to TEXT,
      revealed BOOLEAN DEFAULT false
    )
  `);
};

/* ---------- QUERIES ---------- */
export const db = {
  addParticipant: (token, name) =>
    pool.query(
      `INSERT INTO participants (token, name) VALUES ($1,$2)`,
      [token, name]
    ),

  listParticipants: () =>
    pool.query(`SELECT * FROM participants`),

  getParticipantByToken: (token) =>
    pool.query(
      `SELECT * FROM participants WHERE token=$1`,
      [token]
    ),

  deleteAll: () =>
    pool.query(`DELETE FROM participants`),

  lockAssign: (pairs) =>
    Promise.all(
      pairs.map(p =>
        pool.query(
          `UPDATE participants
           SET assigned_to=$1, revealed=false
           WHERE token=$2`,
          [p.assignedTo, p.token]
        )
      )
    ),

  markRevealed: (token) =>
    pool.query(
      `UPDATE participants SET revealed=true WHERE token=$1`,
      [token]
    )
};
