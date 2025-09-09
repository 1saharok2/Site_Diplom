// backend/controllers/categoryController.js
const db = require('../config/db');

// Получить все категории
exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).send('Server Error');
  }
};

// Получить одну категорию по ID (может пригодиться позже)
exports.getCategoryById = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching category by ID:', err.message);
    res.status(500).send('Server Error');
  }
};