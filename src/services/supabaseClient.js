import { createClient } from '@supabase/supabase-js'

// Замени эти значения на свои из панели Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

// Проверка наличия обязательных переменных
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.error('Missing Supabase environment variables!')
  console.log('Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file')
  
  // Можно выбросить ошибку или работать в демо-режиме
  // throw new Error('Supabase credentials are missing')
}

// Создание клиента Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'react-ecommerce-store'
    }
  }
})

// Вспомогательная функция для проверки подключения
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1)
    if (error) throw error
    return { connected: true, data }
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return { connected: false, error }
  }
}

export default supabase