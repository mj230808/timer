const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'activity_timer',
  password: 'yourpassword',
  port: 5432,
});

app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Activities (
      activity TEXT PRIMARY KEY,
      time INTEGER DEFAULT 0
    );
  `);

  const activities = ["Email", "Meeting", "Discussion", "Food", "Travel"];
  for (const activity of activities) {
    await pool.query(
      `INSERT INTO Activities (activity, time)
      VALUES ($1, 0) ON CONFLICT (activity) DO NOTHING;`,
      [activity]
    );
  }
}
initDatabase();

// Get all cumulative times
app.get('/activities', async (req, res) => {
  const result = await pool.query('SELECT * FROM Activities');
  res.json(result.rows);
});

// Update cumulative time for an activity
app.post('/update', async (req, res) => {
  const { activity, time } = req.body;
  await pool.query(
    'UPDATE Activities SET time = time + $1 WHERE activity = $2',
    [time, activity]
  );
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
