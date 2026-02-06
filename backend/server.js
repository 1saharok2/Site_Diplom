const express = require('express');
const cors = require('cors');
const pool = require('./config/database'); // подключаем MySQL
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Настройка CORS
app.use(cors({
  origin: ['https://electronic.tw1.ru', 'https://www.electronic.tw1.ru'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 🔹 Проверка сервера
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server and DB connected' });
});

// 🔹 Получение всех категорий
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (error) {
    console.error('DB error (categories):', error);
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

// 🔹 Получение всех продуктов
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error('DB error (products):', error);
    res.status(500).json({ error: 'Ошибка при получении продуктов' });
  }
});

// 🔹 Получение продуктов по категории
app.get('/api/products/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE category_slug = ?',
      [slug]
    );
    res.json(rows);
  } catch (error) {
    console.error('DB error (category):', error);
    res.status(500).json({ error: 'Ошибка при получении продуктов категории' });
  }
});

// 🔹 Получение конкретного продукта
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
    res.json(rows[0]);
  } catch (error) {
    console.error('DB error (product):', error);
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
});

// 🔹 Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
