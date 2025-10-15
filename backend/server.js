const express = require('express');
const cors = require('cors');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://electronic.tw1.ru', 'https://www.electronic.tw1.ru'],
  credentials: true
}));
app.use(express.json());

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

app.listen(PORT, () => console.log(`✅ Сервер запущен на порту ${PORT}`));
