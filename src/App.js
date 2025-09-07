import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './components/Layout/Header/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { CategoriesProvider } from './context/CategoriesContext';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/User/ProfilePage';
import AdminRoute from './components/Common/AdminRoute';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import AdminProducts from './pages/Admin/Products/AdminProducts';
import AdminOrders from './pages/Admin/Orders/AdminOrders';
import AdminUsers from './pages/Admin/Users/AdminUsers';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout';
import AdminCategories from './pages/Admin/Categories/AdminCategories';
import CategoriesPage from './pages/Catalog/CategoriesPage/CategoriesPage';
import CategoryPage from './pages/Catalog/CategoryPage/CategoryPage';
import ProductPage from './pages/Catalog/ProductPage/ProductPage';
import AboutPage from './pages/About/AboutPage/AboutPage';
import ContactsPage from './pages/About/ContactsPage/ContactsPage';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccess/OrderSuccessPage';
import ProtectedCheckoutRoute from './components/Common/ProtectedCheckoutRoute';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <AuthProvider>
        <ProductsProvider>
          <CategoriesProvider>
            <CartProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/catalog" element={<CategoriesPage/>} />
                <Route path="/about" element={<AboutPage/>} />
                <Route path="/contacts" element={<ContactsPage/>} />
                <Route path="/cart" element={<CartPage />} />
                
                {/* Checkout */}
                <Route path="/checkout" element={
                  <ProtectedCheckoutRoute>
                    <CheckoutPage />
                  </ProtectedCheckoutRoute>
                } />
                <Route path="/order-success" element={<OrderSuccessPage />} />

                {/* Protected user routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />

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
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="" element={<Navigate to="dashboard" />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                } />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
          </CategoriesProvider>
        </ProductsProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;