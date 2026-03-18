console.log('AUTH ROUTES LOADED');
import jwt from 'jsonwebtoken';
import { JWT_SECRET} from '../config/env.js';
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const router = express.Router();

router.get('/ping', (req, res) => { 
  res.json({ pong: true });
});

/* ================= REGISTER ================= */

router.post('/register', async (req, res) => {
  try {
    const {
      business_name,
      business_email,
      plan_id,
      name,
      email,
      password
    } = req.body;

    if (!business_name || !business_email || !plan_id || !name || !email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const [businessResult] = await pool.query(
      'INSERT INTO businesses (name, email, plan_id) VALUES (?, ?, ?)',
      [business_name, business_email, plan_id]
    );

    const businessId = businessResult.insertId;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (business_id, name, email, password) VALUES (?, ?, ?, ?)',
      [businessId, name, email, hashedPassword]
    );

    res.status(201).json({
      message: 'Business and admin user created successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= LOGIN ================= */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
  {
    id: user.id,
    business_id: user.business_id
  },
  JWT_SECRET,
  { expiresIn: '2h' }
);

res.json({
  message: 'Login successful',
  token
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;