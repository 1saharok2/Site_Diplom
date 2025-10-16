const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) AS cnt FROM users');
    const [[productsCount]] = await pool.query('SELECT COUNT(*) AS cnt FROM products');
    const [[ordersCount]] = await pool.query('SELECT COUNT(*) AS cnt FROM orders');
    const [recentOrders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');

    res.json({
      users: usersCount?.cnt || 0,
      products: productsCount?.cnt || 0,
      orders: ordersCount?.cnt || 0,
      recentOrders: recentOrders || []
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(rows || []);
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
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    const [rows] = await pool.query('SELECT id, email, role FROM users WHERE id = ? LIMIT 1', [id]);
    const user = Array.isArray(rows) && rows[0];
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ message: 'Роль пользователя обновлена', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Ошибка обновления роли' });
  }
});

// Получить все продукты
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    const [images] = await pool.query('SELECT product_id, image_url FROM product_images ORDER BY sort_order ASC');
    const imagesByProduct = images.reduce((acc, row) => {
      (acc[row.product_id] = acc[row.product_id] || []).push(row.image_url);
      return acc;
    }, {});
    const result = products.map(p => ({ ...p, images: imagesByProduct[p.id] || [] }));
    res.json(result);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить один товар 
router.get('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });
    const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]);
    res.json({ ...product, images: images.map(i => i.image_url) });
  } catch (error) {
    console.error('Ошибка сервера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создать новый продукт
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productData = { ...req.body };
    const images = Array.isArray(productData.images) ? productData.images : [];
    delete productData.images;
    const columns = Object.keys(productData);
    const values = Object.values(productData);
    const placeholders = columns.map(() => '?').join(',');
    const [result] = await pool.query(
      `INSERT INTO products (${columns.join(',')}) VALUES (${placeholders})`,
      values
    );
    const productId = result.insertId;
    if (images.length > 0) {
      const valuesFlat = images.map((url, idx) => [productId, url, idx]).flat();
      const placeholdersImgs = images.map(() => '(?, ?, ?)').join(',');
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ${placeholdersImgs}`,
        valuesFlat
      );
    }
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    const [imgRows] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [productId]);
    res.status(201).json({ ...product, images: imgRows.map(i => i.image_url) });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Обновить продукт
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productData = { ...req.body };
    const images = Array.isArray(productData.images) ? productData.images : [];
    delete productData.images;
    if (Object.keys(productData).length > 0) {
      const setClause = Object.keys(productData).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE products SET ${setClause} WHERE id = ?`, [...Object.values(productData), id]);
    }
    // replace images
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    if (images.length > 0) {
      const valuesFlat = images.map((url, idx) => [id, url, idx]).flat();
      const placeholdersImgs = images.map(() => '(?, ?, ?)').join(',');
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, sort_order) VALUES ${placeholdersImgs}`,
        valuesFlat
      );
    }
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const [imgRows] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]);
    res.json({ ...product, images: imgRows.map(i => i.image_url) });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Вспомогательная функция для получения продукта с изображениями
async function getProductWithImages(productId) {
  const [[product]] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [productId]);
  if (!product) return null;
  const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [productId]);
  return { ...product, images: images.map(i => i.image_url) };
}

// Удалить продукт
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Товар и его изображения успешно удалены' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить все заказы
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить статус заказа
router.put('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const [[row]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(row || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// duplicate stats route removed (kept first definition above)

// GET /api/admin/categories - получение всех категорий для админки
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_slug = c.slug) AS products_count FROM categories c ORDER BY name ASC');
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/categories - создание категории
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;
    const [result] = await pool.query('INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)', [name, slug, parent_id || null]);
    const [[row]] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/categories/:id - обновление категории
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id } = req.body;
    await pool.query('UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?', [name, slug, parent_id || null, id]);
    const [[row]] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/categories/:id - удаление категории
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;