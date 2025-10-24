const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
const productsRouter = require('./routes/products');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Log server startup
console.log('🚀 Starting server...');
console.log('📡 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

app.use(cors({
  origin: ['https://electronic.tw1.ru', 'https://www.electronic.tw1.ru'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (API + DB)
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    return res.json({ status: 'OK', db: rows && rows[0] && rows[0].ok === 1 });
  } catch (e) {
    return res.status(500).json({ status: 'ERROR', error: e.message });
  }
});

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// List all available routes
app.get('/api/routes', (req, res) => {
  const routes = [
    'GET /api/health',
    'GET /api/test', 
    'GET /api/routes',
    'GET /api/categories',
    'GET /api/products',
    'GET /api/products/:id',
    'POST /api/auth/register',
    'POST /api/auth/login'
  ];
  res.json({ routes });
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

// Подключаем роуты для товаров
app.use('/api/products', productsRouter);

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received');
    console.log('Register request headers:', req.headers);
    console.log('Register request body:', req.body);
    
    const { email, password, firstName, lastName } = req.body || {};
    console.log('Extracted registration data:', { email, firstName, lastName });
    
    if (!email || !password) {
      console.log('Missing email or password in registration');
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
    console.log('Login request headers:', req.headers);
    console.log('Login request body:', req.body);
    console.log('Login request body type:', typeof req.body);
    
    const { email, password } = req.body || {};
    console.log('Extracted email:', email);
    console.log('Extracted password:', password);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        message: 'Не указаны имя пользователя или пароль.',
        received_data: req.body 
      });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  console.log('❌ 404 - API route not found:', req.originalUrl);
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log(`🔍 Тестовый endpoint: http://localhost:${PORT}/api/test`);
});
