console.log('AUTH ROUTES LOADED');
import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
const router = express.Router();

router.get('/ping', (req, res) => {
  res.json({ pong: true });
});

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

    // 1️⃣ Crear negocio
    const [businessResult] = await pool.query(
      'INSERT INTO businesses (name, email, plan_id) VALUES (?, ?, ?)',
      [business_name, business_email, plan_id]
    );

    const businessId = businessResult.insertId;

    // 2️⃣ Hash contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Crear usuario admin
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

export default router;