import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import reportWebVitals from './reportWebVitals';

// Функция для регистрации Service Worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker зарегистрирован:', registration);
    } catch (error) {
      console.error('❌ Ошибка регистрации Service Worker:', error);
    }
  }
};

// Компонент для отображения загрузки
const AppLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '5px solid #f3f3f3',
      borderTop: '5px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '20px', color: '#666' }}>Загрузка приложения...</p>
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <React.Suspense fallback={<AppLoader />}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.Suspense>
  </React.StrictMode>
);

// Запускаем Service Worker
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker().catch(console.error);
}

// Отчет о веб-метриках
reportWebVitals(console.log);