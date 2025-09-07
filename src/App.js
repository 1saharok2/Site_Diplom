import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext/CartContext';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import AdminRoute from './components/Common/AdminRoute';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminProducts from './pages/Admin/Products/AdminProducts';
import AdminOrders from './pages/Admin/Orders/AdminOrders';
import AdminUsers from './pages/Admin/Users/AdminUsers';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout';

// Правильные импорты для вашей структуры папок
import CategoriesPage from './pages/Catalog/CategoriesPage/CategoriesPage.jsx';
import CategoryPage from './pages/Catalog/CategoryPage/CategoryPage.jsx';
import ProductPage from './pages/Catalog/ProductPage/ProductPage.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div>
            <Header />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Catalog routes */}
              <Route path="/catalog" element={<CategoriesPage />} />
              <Route path="/catalog/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="" element={<Navigate to="dashboard" />} />
                    </Routes>
                  </AdminLayout>
                </AdminRoute>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;