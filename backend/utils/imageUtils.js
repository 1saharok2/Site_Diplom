const pool = require('../config/database');

const saveProductImages = async (productId, images) => {
  try {
    if (!Array.isArray(images) || images.length === 0) {
      return [];
    }

    await pool.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

    const imageRecords = images.map((imageUrl, index) => ({
      product_id: productId,
      image_url: imageUrl,
      is_main: index === 0, // первое изображение - основное
      sort_order: index
    }));

    const placeholders = imageRecords.map(() => '(?, ?, ?, ?)').join(',');
    const values = imageRecords.flatMap(r => [r.product_id, r.image_url, r.is_main ? 1 : 0, r.sort_order]);
    await pool.query(
      `INSERT INTO product_images (product_id, image_url, is_main, sort_order) VALUES ${placeholders}`,
      values
    );
    const [rows] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [productId]);
    return rows;

  } catch (error) {
    console.error('Error saving product images:', error);
    throw error;
  }
};

const getProductImages = async (productId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [productId]);
    return rows || [];

  } catch (error) {
    console.error('Error getting product images:', error);
    return [];
  }
};

const deleteProductImages = async (productId) => {
  try {
    await pool.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
    
  } catch (error) {
    console.error('Error deleting product images:', error);
    throw error;
  }
};

module.exports = {
  saveProductImages,
  getProductImages,
  deleteProductImages
};