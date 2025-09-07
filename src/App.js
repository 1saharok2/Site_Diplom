import AdminRoute from './components/Common/AdminRoute';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import AdminProducts from './pages/Admin/AdminProducts/AdminProducts';
import AdminOrders from './pages/Admin/AdminOrders/AdminOrders';
import AdminUsers from './pages/Admin/AdminUsers/AdminUsers';

// В компоненте App добавить маршруты:
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