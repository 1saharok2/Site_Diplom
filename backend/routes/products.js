const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// GET /api/products - все продукты
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    
    // Загружаем изображения для всех товаров
    const products = await Promise.all(rows.map(async (product) => {
      const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
      const imageUrls = images.map(img => img.image_url);
      
      // Если нет изображений в product_images, используем image_url из products
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls.push(product.image_url);
      }
      
      return {
        ...product,
        images: imageUrls,
        image_url: imageUrls // для совместимости
      };
    }));
    
    res.json(products || []);
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
    
    // Загружаем все изображения товара из таблицы product_images
    const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [id]);
    const imageUrls = images.map(img => img.image_url);
    
    // Если нет изображений в product_images, используем image_url из products
    if (imageUrls.length === 0 && product.image_url) {
      imageUrls.push(product.image_url);
    }
    
    res.json({ 
      ...product, 
      images: imageUrls,
      image_url: imageUrls // для совместимости
    });
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
    
    // Загружаем изображения для всех товаров
    const products = await Promise.all(rows.map(async (product) => {
      const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
      const imageUrls = images.map(img => img.image_url);
      
      // Если нет изображений в product_images, используем image_url из products
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls.push(product.image_url);
      }
      
      return {
        ...product,
        images: imageUrls,
        image_url: imageUrls // для совместимости
      };
    }));
    
    res.json(products || []);
  } catch (error) {
    console.error('Ошибка базы данных:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// GET /api/products/search?q=query - поиск товаров
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json([]);
    }
    
    const searchTerm = `%${q.trim()}%`;
    const [rows] = await pool.query(`
      SELECT * FROM products 
      WHERE name LIKE ? OR description LIKE ? OR brand LIKE ?
      ORDER BY id DESC
    `, [searchTerm, searchTerm, searchTerm]);
    
    // Загружаем изображения для всех найденных товаров
    const products = await Promise.all(rows.map(async (product) => {
      const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
      const imageUrls = images.map(img => img.image_url);
      
      // Если нет изображений в product_images, используем image_url из products
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls.push(product.image_url);
      }
      
      return {
        ...product,
        images: imageUrls,
        image_url: imageUrls // для совместимости
      };
    }));
    
    res.json(products || []);
  } catch (error) {
    console.error('Ошибка поиска товаров:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

// GET /api/products/variants/:baseName - получить варианты товара по базовому названию
router.get('/variants/:baseName', async (req, res) => {
  try {
    const { baseName } = req.params;
    if (!baseName) {
      return res.json([]);
    }
    
    // Поиск товаров по базовому названию (убираем варианты цвета и памяти)
    const searchTerm = `%${baseName}%`;
    const [rows] = await pool.query(`
      SELECT * FROM products 
      WHERE name LIKE ? AND is_active = 1
      ORDER BY id DESC
    `, [searchTerm]);
    
    // Загружаем изображения для всех найденных товаров
    const variants = await Promise.all(rows.map(async (product) => {
      const [images] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [product.id]);
      const imageUrls = images.map(img => img.image_url);
      
      // Если нет изображений в product_images, используем image_url из products
      if (imageUrls.length === 0 && product.image_url) {
        imageUrls.push(product.image_url);
      }
      
      return {
        ...product,
        images: imageUrls,
        image_url: imageUrls // для совместимости
      };
    }));
    
    res.json(variants || []);
  } catch (error) {
    console.error('Ошибка получения вариантов товара:', error);
    res.status(500).json({ error: 'Ошибка базы данных' });
  }
});

module.exports = router;