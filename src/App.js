import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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

// Временные компоненты
const CategoriesPage = () => <div>Категории (в разработке)</div>;

const CategoryPage = () => {
  const { slug } = useParams(); // Теперь useParams импортирован
  return <div>Категория: {slug} (в разработке)</div>;
};

const ProductPage = () => {
  const { id } = useParams(); // Теперь useParams импортирован
  return <div>Товар ID: {id} (в разработке)</div>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div>
          
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