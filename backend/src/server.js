import express from 'express';
import pool from './config/db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'Connected to MySQL 🚀' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});