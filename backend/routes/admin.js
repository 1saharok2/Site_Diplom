const express = require('express');
const supabase = require('../config/supabase');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Получаем количество пользователей
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Получаем количество товаров
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Получаем количество заказов
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // Получаем последние заказы
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      users: usersCount || 0,
      products: productsCount || 0,
      orders: ordersCount || 0,
      recentOrders: recentOrders || []
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Получить всех пользователей (только для админов)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ 
      success: true,
      users: users || [] 
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// Изменить роль пользователя (только для админов)
router.put('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Роль пользователя обновлена',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Ошибка обновления роли' });
  }
});

// Получить все продукты (админская версия)
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Запрос товаров для админки');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки товаров:', error);
      return res.status(500).json({ error: 'Ошибка загрузки товаров' });
    }

    console.log(`Отправлено товаров: ${products?.length || 0}`);
    res.json(products || []);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить один товар (для админки)
router.get('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Запрос товара для админки ID: ${id}`);
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Ошибка загрузки товара:', error);
      return res.status(404).json({ error: 'Товар не найден' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать новый продукт
router.post('/products', requireAdmin, async (req, res) => {
  try {
    const productData = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить продукт
router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить продукт
router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все заказы
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить статус заказа
router.put('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;