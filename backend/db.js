import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const initDB = async () => {
  // Create tables separately to ensure they exist before foreign keys are added
  await pool.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rounds (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP DEFAULT NOW(),
      active BOOLEAN DEFAULT true
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      token TEXT PRIMARY KEY,
      round_id INT REFERENCES rounds(id),
      participant_id INT REFERENCES participants(id),
      assigned_to TEXT NOT NULL,
      revealed BOOLEAN DEFAULT false
    );
  `);
};

export const db = {
  addParticipant: (name) =>
    pool.query(`INSERT INTO participants (name) VALUES ($1)`, [name]),

  deleteParticipant: (id) =>
    pool.query(`DELETE FROM participants WHERE id=$1`, [id]),

  listParticipants: () =>
    pool.query(`SELECT * FROM participants ORDER BY name`),

  deactivateRounds: () =>
    pool.query(`UPDATE rounds SET active=false`),

  createRound: () =>
    pool.query(`INSERT INTO rounds DEFAULT VALUES RETURNING id`),

  createAssignment: (token, roundId, participantId, assignedTo) =>
    pool.query(
      `INSERT INTO assignments
       (token, round_id, participant_id, assigned_to)
       VALUES ($1,$2,$3,$4)`,
      [token, roundId, participantId, assignedTo]
    ),

  getReveal: (token) =>
    pool.query(`
      SELECT a.*, r.active
      FROM assignments a
      JOIN rounds r ON r.id = a.round_id
      WHERE a.token=$1
    `, [token]),

  markRevealed: (token) =>
    pool.query(`UPDATE assignments SET revealed=true WHERE token=$1`, [token]),

  dashboardStatus: () =>
    pool.query(`
      SELECT p.name, a.revealed
      FROM assignments a
      JOIN participants p ON p.id = a.participant_id
      JOIN rounds r ON r.id = a.round_id
      WHERE r.active=true
      ORDER BY p.name
    `)
};