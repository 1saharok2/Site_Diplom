import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import Header from './components/Layout/Header/Header';
import Footer from './components/Layout/Footer/Footer';
import AdminLayout from './components/Admin/AdminLayout/AdminLayout';
import { AdminRoute, ProtectedRoute, ProtectedCheckoutRoute } from './components/Common';
import { AuthProvider, CartProvider, ProductsProvider, CategoriesProvider, WishlistProvider } from './context';
import { ReviewProvider } from './context/ReviewContext';
import ScrollToTop from './components/ScrollToTop';
import { initAuth } from './utils/authSync';
import './App.css';

// Ленивая загрузка страниц
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const CategoriesPage = lazy(() => import('./pages/Catalog/CategoriesPage/CategoriesPage'));
const CategoryPage = lazy(() => import('./pages/Catalog/CategoryPage/CategoryPage'));
const ProductPage = lazy(() => import('./pages/Catalog/ProductPage/ProductPage'));
const AboutPage = lazy(() => import('./pages/About/AboutPage/AboutPage'));
const ContactsPage = lazy(() => import('./pages/About/ContactsPage/ContactsPage'));
const CartPage = lazy(() => import('./pages/Cart/CartPage'));
const SearchPage = lazy(() => import('./pages/Search/SearchPage'));
const CheckoutPage = lazy(() => import('./pages/Checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/Orders/OrderSuccessPage'));
const OrderDetailPage = lazy(() => import('./pages/Orders/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/User/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/User/OrdersPage'));
const WishlistPage = lazy(() => import('./pages/User/WishlistPage'));
const UserReviewsPage = lazy(() => import('./pages/User/UserReviewPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/About/PrivacyPolicyPage/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/About/TermsOfServicePage/TermsOfServicePage'));

// Ленивая загрузка админских страниц
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/Admin/Products/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/Admin/Orders/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/Admin/Users/AdminUsers'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories/AdminCategories'));
const AdminReviewsPage = lazy(() => import('./components/Admin/AdminReviewsPage'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Компонент загрузки
const Loader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
);

// Компонент для отображения загрузки с минимальной высотой
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<Loader />}>
    {children}
  </Suspense>
);

// Добавьте компонент для начальной загрузки
const InitialLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress size={60} />
  </Box>
);

function App() {
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Инициализация авторизации при загрузке приложения
  useEffect(() => {
    console.log('🚀 Инициализация приложения...');
    
    // 1. Инициализируем авторизацию
    const authState = initAuth();
    console.log('✅ Авторизация инициализирована:', authState);
    
    // 2. Устанавливаем флаг, что авторизация инициализирована
    setIsAuthInitialized(true);
    
    // 3. Предзагрузка ключевых страниц
    const preloadCriticalPages = async () => {
      try {
        setTimeout(async () => {
          await Promise.allSettled([
            import('./pages/Cart/CartPage'),
            import('./pages/Catalog/CategoriesPage/CategoriesPage'),
            import('./pages/Search/SearchPage')
          ]);
          console.log('📦 Ключевые страницы предзагружены');
        }, 3000);
      } catch (error) {
        console.log('Предзагрузка страниц не удалась:', error);
      }
    };

    preloadCriticalPages();
    
    // 4. Логируем начальное состояние
    console.log('📋 Начальное состояние localStorage:', {
      userId: localStorage.getItem('userId'),
      hasToken: !!localStorage.getItem('authToken'),
      hasUserData: !!localStorage.getItem('userData')
    });
    
  }, []);

  // Показываем загрузчик пока не инициализирована авторизация
  if (!isAuthInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <InitialLoader />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <WishlistProvider>
          <ReviewProvider>
            <ProductsProvider>
              <CategoriesProvider>
                <CartProvider>
                  <Router>
                    <ScrollToTop />
                    <div className="app" style={{
                      display: "flex",
                      flexDirection: 'column',
                      minHeight: '100vh',
                      margin: 0,
                      padding: 0
                    }}>
                      <Routes>
                        <Route path="/admin/*" element={null} />
                        <Route path="*" element={<Header />} />
                      </Routes>
                      
                      <main className="main-content" style={{ flex: 1 }}>
                        <Routes>
                          <Route path="/" element={<SuspenseWrapper><HomePage /></SuspenseWrapper>} />
                          <Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
                          <Route path="/register" element={<SuspenseWrapper><RegisterPage /></SuspenseWrapper>} />
                          <Route path="/catalog" element={<SuspenseWrapper><CategoriesPage /></SuspenseWrapper>} />
                          <Route path="/about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
                          <Route path="/privacy-policy" element={<SuspenseWrapper><PrivacyPolicyPage /></SuspenseWrapper>} />
                          <Route path="/terms-of-service" element={<SuspenseWrapper><TermsOfServicePage /></SuspenseWrapper>} />
                          <Route path="/contacts" element={<SuspenseWrapper><ContactsPage /></SuspenseWrapper>} />
                          <Route path="/cart" element={<SuspenseWrapper><CartPage /></SuspenseWrapper>} />
                          <Route path="/search" element={<SuspenseWrapper><SearchPage /></SuspenseWrapper>} />
                          <Route path="/catalog/:slug" element={<SuspenseWrapper><CategoryPage /></SuspenseWrapper>} />
                          <Route path="/product/:id" element={<SuspenseWrapper><ProductPage /></SuspenseWrapper>} />
                          
                          <Route path="/checkout" element={
                            <ProtectedCheckoutRoute><SuspenseWrapper><CheckoutPage /></SuspenseWrapper></ProtectedCheckoutRoute>
                          } />
                          <Route path="/order-success" element={<SuspenseWrapper><OrderSuccessPage /></SuspenseWrapper>} />

                          <Route path="/profile" element={
                            <ProtectedRoute><SuspenseWrapper><ProfilePage /></SuspenseWrapper></ProtectedRoute>
                          } />
                          <Route path="/orders" element={
                            <ProtectedRoute><SuspenseWrapper><OrdersPage /></SuspenseWrapper></ProtectedRoute>
                          } />
                          <Route path="/orders/:orderId" element={<SuspenseWrapper><OrderDetailPage /></SuspenseWrapper>} />
                          <Route path="/wishlist" element={
                            <ProtectedRoute><SuspenseWrapper><WishlistPage /></SuspenseWrapper></ProtectedRoute>
                          } />
                          <Route path="/reviews" element={
                            <ProtectedRoute><SuspenseWrapper><UserReviewsPage /></SuspenseWrapper></ProtectedRoute>
                          } />

                          <Route path="/admin/*" element={
                            <AdminRoute>
                              <AdminLayout>
                                <Suspense fallback={<Loader />}>
                                  <Routes>
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="users" element={<AdminUsers />} />
                                    <Route path="categories" element={<AdminCategories />} />
                                    <Route path="reviews" element={<AdminReviewsPage />} />
                                    <Route path="" element={<Navigate to="dashboard" />} />
                                  </Routes>
                                </Suspense>
                              </AdminLayout>
                            </AdminRoute>
                          } />

                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </main>
                      
                      <Routes>
                        <Route path="/admin/*" element={null} />
                        <Route path="*" element={<Footer />} />
                      </Routes>
                    </div>
                  </Router>
                </CartProvider>
              </CategoriesProvider>
            </ProductsProvider>
          </ReviewProvider>
        </WishlistProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default React.memo(App);