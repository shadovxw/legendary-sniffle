import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const initDB = async () => {
  try {
    // Drop and recreate tables to ensure clean state
    // Only drop assignments first (has foreign keys)
    await pool.query(`DROP TABLE IF EXISTS assignments CASCADE;`);
    
    // Create participants table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    
    console.log('✓ Participants table ready');

    // Create rounds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rounds (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        active BOOLEAN DEFAULT true
      );
    `);
    
    console.log('✓ Rounds table ready');

    // Create assignments table with foreign keys
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        token TEXT PRIMARY KEY,
        round_id INT REFERENCES rounds(id) ON DELETE CASCADE,
        participant_id INT REFERENCES participants(id) ON DELETE CASCADE,
        assigned_to TEXT NOT NULL,
        revealed BOOLEAN DEFAULT false
      );
    `);
    
    console.log('✓ Assignments table ready');
    console.log('✓ Database initialized successfully');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
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