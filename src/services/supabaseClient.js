import { createClient } from '@supabase/supabase-js'

// Твои реальные ключи из backend/.env
const supabaseUrl = 'https://lpdpyyibqkzmchoxdema.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwZHB5eWlicWt6bWNob3hkZW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDE4NDYsImV4cCI6MjA3MjkxNzg0Nn0.l8Mvh-Fk-wa7P1prSKprpVSgfPX-IFhlKwItBWw0a7w'

// Проверка наличия обязательных переменных
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ Supabase URL is missing or invalid!')
  throw new Error('Supabase URL is not configured')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.error('❌ Supabase Anon Key is missing or invalid!')
  throw new Error('Supabase Anon Key is not configured')
}

// Создание клиента Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'react-ecommerce-store',
      'x-client-info': 'react-frontend'
    }
  }
})

// Вспомогательная функция для проверки подключения
export const testConnection = async () => {
  try {
    console.log('🔌 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection failed:', error)
      throw error
    }

    console.log('✅ Supabase connected successfully!')
    console.log('📊 Sample data:', data)
    return { connected: true, data }
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error)
    return { connected: false, error: error.message }
  }
}

// Функция для подписки на изменения в реальном времени
export const subscribeToTable = (tableName, callback) => {
  return supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: tableName
      },
      callback
    )
    .subscribe()
}

// Экспорт для тестирования
console.log('🚀 Supabase client initialized:')
console.log('📍 URL:', supabaseUrl)
console.log('🔑 Anon Key:', supabaseAnonKey.slice(0, 10) + '...')

// Автоматически тестируем подключение при импорте
testConnection().then(result => {
  if (result.connected) {
    console.log('🎉 Supabase is ready to use!')
  } else {
    console.warn('⚠️ Supabase connection issues detected')
  }
})

export default supabase