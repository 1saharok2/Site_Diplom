const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: __dirname + '/../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase URL and Anon Key are required in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Проверка подключения
supabase.from('categories').select('count')
  .then(result => console.log('✅ Supabase client created successfully'))
  .catch(error => console.log('❌ Supabase client error:', error.message));

module.exports = supabase;