const express = require('express');
const supabase = require('../config/supabase');
const router = express.Router();

// GET /api/users - все пользователи (только для админов)
router.get('/', async (req, res) => {
  try {
    console.log('Запрос на получение всех пользователей');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка Supabase:', error);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }

    console.log(`Отправлено пользователей: ${data?.length || 0}`);
    res.json(data || []);
    
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
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Ошибка Supabase:', error);
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(data);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;