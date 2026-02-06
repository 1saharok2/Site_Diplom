const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET /api/products - все продукты
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка Supabase:', error);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(data || []);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/products/:id - один продукт
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Ошибка Supabase:', error);
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Продукт не найден' });
    }

    res.json(data);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// GET /api/products/category/:slug - продукты по категории
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_slug', slug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка Supabase:', error);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    res.json(data || []);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;