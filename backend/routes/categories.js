const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// GET /api/categories - все категории
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows || []);
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// GET /api/categories/:slug - одна категория
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
    const category = Array.isArray(rows) && rows[0];
    if (!category) return res.status(404).json({ error: 'Категория не найдена' });
    res.json(category);
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

module.exports = router;