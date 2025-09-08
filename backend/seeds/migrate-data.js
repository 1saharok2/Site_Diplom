const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const migrateData = async () => {
  try {
    console.log('Starting data migration...');

    // Сначала очистите таблицы если нужно
    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('categories').delete().neq('id', 0);

    // Категории
    const categories = [
      { name: 'Смартфоны', slug: 'smartphones', description: 'Смартфоны, кнопочные телефоны и аксессуары', image_url: 'https://via.placeholder.com/400x300/007bff/ffffff?text=📱+Смартфоны', product_count: 156 },
      { name: 'Ноутбуки', slug: 'laptops', description: 'Ноутбуки, ультрабуки и игровые устройства', image_url: 'https://via.placeholder.com/400x300/28a745/ffffff?text=💻+Ноутбуки', product_count: 89 },
      { name: 'Телевизоры', slug: 'tvs', description: 'Телевизоры, мониторы и медиатехника', image_url: 'https://via.placeholder.com/400x300/dc3545/ffffff?text=📺+Телевизоры', product_count: 67 },
      { name: 'Наушники', slug: 'headphones', description: 'Наушники, гарнитуры и аудиотехника', image_url: 'https://via.placeholder.com/400x300/6f42c1/ffffff?text=🎧+Наушники', product_count: 124 },
      { name: 'Фототехника', slug: 'photo', description: 'Фотоаппараты, объективы и аксессуары', image_url: 'https://via.placeholder.com/400x300/fd7e14/ffffff?text=📸+Фототехника', product_count: 78 },
      { name: 'Игровые консоли', slug: 'gaming', description: 'Игровые приставки, игры и аксессуары', image_url: 'https://via.placeholder.com/400x300/20c997/ffffff?text=🎮+Консоли', product_count: 45 },
      { name: 'Бытовая техника', slug: 'appliances', description: 'Холодильники, стиральные машины и техника для дома', image_url: 'https://via.placeholder.com/400x300/6c757d/ffffff?text=🏠+Техника', product_count: 203 },
      { name: 'Умный дом', slug: 'smart-home', description: 'Умные устройства для автоматизации дома', image_url: 'https://via.placeholder.com/400x300/0dcaf0/000000?text=🏠+Умный+дом', product_count: 92 }
    ];

    console.log('Inserting categories...');
    for (const category of categories) {
      const { error } = await supabase.from('categories').insert(category);
      if (error) console.error('Category error:', error.message);
      else console.log(`✅ ${category.name}`);
    }

    // Продукты
    const products = [
      { name: 'Смартфон Apple iPhone 16', slug: 'apple-iphone-16', price: 79990, old_price: 84900, description: 'Новый iPhone 16 с улучшенной камерой', images: ['https://via.placeholder.com/400x400/000000/ffffff?text=iPhone+16'], category_slug: 'smartphones', brand: 'Apple', rating: 4.0, reviews_count: 128, is_new: true, discount: 6, in_stock: true },
      { name: 'Смартфон Samsung Galaxy S23 Ultra', slug: 'samsung-galaxy-s23-ultra', price: 89900, old_price: 99900, description: 'Флагманский смартфон Samsung с S-Pen', images: ['https://via.placeholder.com/400x400/1428a0/ffffff?text=S23+Ultra'], category_slug: 'smartphones', brand: 'Samsung', rating: 4.5, reviews_count: 256, is_new: false, discount: 10, in_stock: true },
      // ... добавьте остальные продукты с полем brand
    ];

    console.log('Inserting products...');
    for (const product of products) {
      const { error } = await supabase.from('products').insert(product);
      if (error) console.error('Product error:', error.message);
      else console.log(`✅ ${product.name}`);
    }

    console.log('✅ Data migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
};

migrateData();