const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://electronic.tw1.ru', 'https://www.electronic.tw1.ru'],
  credentials: true
}));
app.use(express.json());

// Health check (API + DB)
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.json({ status: 'OK', db: rows && rows[0] && rows[0].ok === 1 });
  } catch (e) {
    return res.status(500).json({ status: 'ERROR', error: e.message });
  }
});

// Получить все категории
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить все продукты
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения продуктов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить продукт по ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Ошибка получения продукта:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Проверяем, существует ли пользователь
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, firstName || null, lastName || null, 'customer']
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { userId, email, role: 'customer' },
      process.env.JWT_SECRET || 'change_me_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const [rows] = await pool.query('SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ? LIMIT 1', [email]);
    const user = Array.isArray(rows) && rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash || '');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'customer' },
      process.env.JWT_SECRET || 'change_me_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name || null,
        lastName: user.last_name || null,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
