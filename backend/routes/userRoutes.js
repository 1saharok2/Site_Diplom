const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// GET /api/users - все пользователи (только для админов)
router.get('/', async (req, res) => {
  try {
    console.log('Запрос на получение всех пользователей');
    const [rows] = await pool.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC');
    console.log(`Отправлено пользователей: ${rows?.length || 0}`);
    res.json(rows || []);
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/users/:id - один пользователь
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Запрос пользователя ID: ${id}`);
    const [rows] = await pool.query('SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ? LIMIT 1', [id]);
    const user = Array.isArray(rows) && rows[0];
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;