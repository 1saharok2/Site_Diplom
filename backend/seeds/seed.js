const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

const migrateData = async () => {
  try {
    // Читаем данные из вашего db.json
    const rawData = fs.readFileSync(path.join(__dirname, '../../db.json'));
    const data = JSON.parse(rawData);

    // Мигрируем продукты
    for (const product of data.products) {
      await pool.query(
        `INSERT INTO products (name, price, description, image, category, stock, specifications) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          product.name,
          product.price,
          product.description,
          product.image,
          product.category,
          product.stock || 10,
          JSON.stringify(product.specifications || {})
        ]
      );
    }

    // Мигрируем категории
    for (const category of data.categories) {
      await pool.query(
        'INSERT INTO categories (name, image) VALUES ($1, $2)',
        [category.name, category.image]
      );
    }

    console.log('Data migrated successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
};

migrateData();