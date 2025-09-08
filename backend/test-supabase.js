// Явно укажите путь к .env файлу
require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('Current directory:', __dirname);
console.log('URL:', process.env.SUPABASE_URL);
console.log('Key:', process.env.SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');

// Проверьте, что переменные загружены
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables are missing!');
  console.error('Check your .env file in:', __dirname);
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Простой тест - получим что-нибудь из базы
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Supabase error:', error.message);
      // Если таблицы нет - это нормально на первом этапе
      if (error.code === '42P01') {
        console.log('⚠️  Table does not exist yet - but connection works!');
        console.log('✅ Supabase connection is successful!');
        return;
      }
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testConnection();