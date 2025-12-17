import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://secret_santa_kiz9_user:2Bj0C7DuXWZJUhwGyAP7Uf2DAKGRoMVq@dpg-d51amnmmcj7s73en6fkg-a/secret_santa_kiz9",
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL
    )
  `);

  // insert admin only once
  await pool.query(`
    INSERT INTO admin (username, password)
    VALUES ('admin', 'admin123')
    ON CONFLICT DO NOTHING
  `);
};

/* ---------- QUERIES ---------- */
export const db = {
  getAdmin: () =>
    pool.query(`SELECT * FROM admin LIMIT 1`),

  addParticipant: (p) =>
    pool.query(
      `INSERT INTO participants (token, name) VALUES ($1,$2)`,
      [p.token, p.name]
    ),

  listParticipants: () =>
    pool.query(`SELECT * FROM participants`),

  updateName: (id, name) =>
    pool.query(
      `UPDATE participants SET name=$1 WHERE token=$2`,
      [name, id]
    ),

  deleteParticipant: (id) =>
    pool.query(
      `DELETE FROM participants WHERE token=$1`,
      [id]
    ),

  lockAssign: (pairs) =>
    Promise.all(
      pairs.map(p =>
        pool.query(
          `UPDATE participants SET assigned_to=$1, revealed=false WHERE token=$2`,
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
