const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// GET /api/products - все продукты
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows || []);
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// GET /api/products/:id - один продукт
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    const product = Array.isArray(rows) && rows[0];
    if (!product) return res.status(404).json({ error: 'Продукт не найден' });
    res.json(product);
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// GET /api/products/category/:slug - продукты по категории
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE category_slug = ? ORDER BY id DESC', [slug]);
    res.json(rows || []);
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

module.exports = router;