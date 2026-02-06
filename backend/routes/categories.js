const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET /api/categories - все категории
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

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

// GET /api/categories/:slug - одна категория
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Ошибка Supabase:', error);
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json(data);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;