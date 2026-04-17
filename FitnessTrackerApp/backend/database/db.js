const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        calorie_goal INTEGER DEFAULT 2000,
        height REAL DEFAULT 170,
        weight REAL DEFAULT 70,
        target_weight REAL DEFAULT 65,
        age INTEGER DEFAULT 25,
        gender TEXT DEFAULT 'M',
        activity_level TEXT DEFAULT 'Sedentary',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS food_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        name TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        fat REAL NOT NULL,
        carbs REAL NOT NULL,
        quantity INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS weight_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        weight REAL NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS water_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        glasses INTEGER NOT NULL DEFAULT 1,
        date TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Postgres Database Tables Initialized Successfully');
  } catch (err) {
    console.error('Error creating PostgreSQL tables:', err);
  } finally {
    client.release();
  }
};

// Auto initialize tables if DATABASE_URL is present
if (process.env.DATABASE_URL) {
  initializeDB();
}

module.exports = pool;
