const express = require('express');
const supabase = require('../config/supabase');
const { processProductForDb, processProductFromDb } = require('../utils/productUtils');
const { saveProductImages, getProductImages, deleteProductImages } = require('../utils/imageUtils');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

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

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, created_at')
      .order('created_at', { ascending: false });
    
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Ошибка получения пользователей' });
      }

    
      res.json(users || []);

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

// Получить все продукты
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images: images.map(img => img.image_url)
        };
      })
    );

    res.json(productsWithImages);

  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить один товар 
router.get('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
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

    const processedProduct = processProductFromDb(product);
    res.json(processedProduct);
    
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать новый продукт
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productData = req.body;
    const images = productData.images || [];
    delete productData.images;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) throw error;

    if (images.length > 0) {
      await saveProductImages(product.id, images);
    }

    const productWithImages = await getProductWithImages(product.id);
    res.status(201).json(productWithImages);

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновить продукт
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const images = productData.images || [];
    delete productData.images; // Удаляем images из основного продукта

    // Обновляем продукт
    const { data: product, error } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    if (images.length > 0) {
      await saveProductImages(id, images);
    }

    const productWithImages = await getProductWithImages(id);
    res.json(productWithImages);

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Вспомогательная функция для получения продукта с изображениями
async function getProductWithImages(productId) {
  try {
    // Получаем продукт
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product) return null;

    // Получаем изображения продукта
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('image_url, is_main, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    // Формируем ответ с массивом URL изображений
    return {
      ...product,
      images: images.map(img => img.image_url) || []
    };

  } catch (error) {
    console.error('Error getting product with images:', error);
    throw error;
  }
}

// Удалить продукт
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await deleteProductImages(id);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Товар и его изображения успешно удалены' });

  } catch (error) {
    console.error('Error deleting product:', error);
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

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Получаем количество заказов
    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' });

    // Получаем количество товаров
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Получаем количество пользователей
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Получаем общую сумму продаж
    const { data: salesData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');

    const totalSales = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // Получаем последние 5 заказов
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      orders: ordersCount || 0,
      products: productsCount || 0,
      users: usersCount || 0,
      sales: totalSales,
      recentOrders: recentOrders || []
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
},

// GET /api/admin/categories - получение всех категорий для админки
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        *,
        products:products (id)  // Получаем связанные товары для подсчета
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    // Добавляем количество товаров в каждой категории
    const categoriesWithCount = categories.map(category => ({
      ...category,
      products_count: category.products ? category.products.length : 0
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}),

// POST /api/admin/categories - создание категории
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, parent_id }])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}),

// PUT /api/admin/categories/:id - обновление категории
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .update({ name, slug, parent_id })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}),

// DELETE /api/admin/categories/:id - удаление категории
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));



module.exports = router;