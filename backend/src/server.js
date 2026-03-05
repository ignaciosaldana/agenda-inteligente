import express from 'express';
import pool from './config/db.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = 4000;

// Middleware para leer JSON
app.use(express.json());

// Ruta base para probar conexión
app.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'Connected to MySQL 🚀' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Rutas de autenticación
app.use('/api', authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});