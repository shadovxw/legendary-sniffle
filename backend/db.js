import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const initDB = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Drop all tables in correct order (reverse of dependencies)
    await pool.query(`DROP TABLE IF EXISTS assignments CASCADE;`);
    console.log('✓ Dropped assignments table');
    
    await pool.query(`DROP TABLE IF EXISTS rounds CASCADE;`);
    console.log('✓ Dropped rounds table');
    
    await pool.query(`DROP TABLE IF EXISTS participants CASCADE;`);
    console.log('✓ Dropped participants table');

    // Now create fresh tables
    await pool.query(`
      CREATE TABLE participants (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    console.log('✓ Created participants table');

    await pool.query(`
      CREATE TABLE rounds (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT NOW(),
        active BOOLEAN DEFAULT true
      );
    `);
    console.log('✓ Created rounds table');

    await pool.query(`
      CREATE TABLE assignments (
        token TEXT PRIMARY KEY,
        round_id INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
        participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        assigned_to TEXT NOT NULL,
        revealed BOOLEAN DEFAULT false
      );
    `);
    console.log('✓ Created assignments table');
    
    console.log('✅ Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};

export const db = {
  addParticipant: (name) =>
    pool.query(`INSERT INTO participants (name) VALUES ($1) RETURNING *`, [name]),

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

export const getActiveLinks = () => {
  return db.query(`
    SELECT p.name, a.token
    FROM assignments a
    JOIN participants p ON p.id = a.participant_id
    JOIN rounds r ON r.id = a.round_id
    WHERE r.active = true
    ORDER BY p.name
  `);
};
