const { supabase } = require('../config/database');
const fs = require('fs');
const path = require('path');

const migrateToSupabase = async () => {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../../db.json'));
    const data = JSON.parse(rawData);

    // Мигрируем категории
    for (const category of data.categories) {
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name: category.name,
            slug: category.name.toLowerCase().replace(/\s+/g, '-'),
            image: category.image,
            description: category.description || ''
          }
        ]);

      if (error) console.error('Category error:', error);
    }

    // Мигрируем продукты
    for (const product of data.products) {
      // Получаем ID категории
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('name', product.category)
        .single();

      const { error } = await supabase
        .from('products')
        .insert([
          {
            name: product.name,
            slug: product.name.toLowerCase().replace(/\s+/g, '-'),
            price: product.price,
            description: product.description,
            images: [product.image],
            category_id: category?.id,
            specifications: product.specifications || {},
            stock: product.stock || 10,
            brand: product.brand || ''
          }
        ]);

      if (error) console.error('Product error:', error);
    }

    console.log('Data migrated to Supabase successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
};

migrateToSupabase();