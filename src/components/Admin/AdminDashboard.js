import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, orders] = await Promise.all([
        adminService.getProducts(),
        adminService.getOrders()
      ]);
      
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(order => order.status === 'pending').length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Панель администратора</h1>
        <Link to="/" className="btn-primary">
          ← На главную
        </Link>
      </header>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Товары</h3>
          <p className="stat-number">{stats.totalProducts || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Заказы</h3>
          <p className="stat-number">{stats.totalOrders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Ожидают обработки</h3>
          <p className="stat-number">{stats.pendingOrders || 0}</p>
        </div>
      </div>

      <nav className="admin-nav">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Управление товарами
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Управление заказами
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;