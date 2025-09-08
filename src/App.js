import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Header from './components/Layout/Header/Header';
import Footer from './components/Layout/Footer/Footer';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout';
import { AdminRoute, ProtectedRoute, ProtectedCheckoutRoute } from './components/Common';
import { AuthProvider, CartProvider, ProductsProvider, CategoriesProvider } from './context';
import { LoginPage, RegisterPage } from './pages/Auth';
import { AdminDashboard, AdminProducts, AdminOrders, AdminUsers, AdminCategories } from './pages/Admin';
import { CategoriesPage, CategoryPage, ProductPage } from './pages/Catalog';
import { AboutPage, ContactsPage } from './pages/About';
import { ProfilePage, OrdersPage, WishlistPage } from './pages/User';
import { SearchPage } from './pages';
import { HomePage, CartPage, CheckoutPage, OrderSuccessPage } from './pages';
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
                <Route path="/search" element={<SearchPage />} />
                
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
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                } />
                <Route path="/reviews" element={
                  <ProtectedRoute>
                    <div>Мои отзывы</div>
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
            <Footer/>
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