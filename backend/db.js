import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ---------- INIT DB ---------- */
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      token TEXT PRIMARY KEY,
      participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
      assigned_to TEXT NOT NULL,
      revealed BOOLEAN DEFAULT false
    );
  `);

  console.log("✅ Database ready");
};

export const db = {
  /* ---------- PARTICIPANTS ---------- */
  addParticipant: (name) =>
    pool.query(`INSERT INTO participants (name) VALUES ($1)`, [name]),

  deleteParticipant: (id) =>
    pool.query(`DELETE FROM participants WHERE id = $1`, [id]),

  listParticipants: () =>
    pool.query(`SELECT * FROM participants ORDER BY name`),

  /* ---------- ASSIGNMENTS ---------- */
  clearAssignments: () =>
    pool.query(`DELETE FROM assignments`),

  createAssignment: (token, participantId, assignedTo) =>
    pool.query(
      `INSERT INTO assignments (token, participant_id, assigned_to)
       VALUES ($1, $2, $3)`,
      [token, participantId, assignedTo]
    ),

  getReveal: (token) =>
    pool.query(
      `SELECT assigned_to, revealed
       FROM assignments
       WHERE token = $1`,
      [token]
    ),

  markRevealed: (token) =>
    pool.query(
      `UPDATE assignments
       SET revealed = true
       WHERE token = $1`,
      [token]
    ),

  dashboardStatus: () =>
    pool.query(`
      SELECT p.name, a.revealed
      FROM assignments a
      JOIN participants p ON p.id = a.participant_id
      ORDER BY p.name
    `),

  getAllLinks: () =>
    pool.query(`
      SELECT p.name, a.token
      FROM assignments a
      JOIN participants p ON p.id = a.participant_id
      ORDER BY p.name
    `)
};
