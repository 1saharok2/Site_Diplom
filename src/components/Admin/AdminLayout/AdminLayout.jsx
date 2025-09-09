import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Админ Панель</h2>
        </div>
        <nav className="admin-sidebar-nav">
          <Link to="/admin/dashboard" className="admin-nav-item">Дашборд</Link>
          <Link to="/admin/products" className="admin-nav-item">Товары</Link>
          <Link to="/admin/orders" className="admin-nav-item">Заказы</Link>
          <Link to="/admin/users" className="admin-nav-item">Пользователи</Link>
          <Link to="/admin/categories" className="admin-nav-item">Категории</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <button 
            onClick={() => navigate('/')} 
            className="admin-nav-item"
          >
            ← На сайт
          </button>
        </div>
      </aside>
      
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;