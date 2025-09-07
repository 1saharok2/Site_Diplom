// src/pages/Admin/Dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import { adminService } from '../../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock данные вместо API запросов
      setStats({
        totalSales: 1240500,
        totalOrders: 156,
        totalProducts: 89,
        totalUsers: 342
      });

      setRecentOrders([
        { id: 1, customer: 'Иван Иванов', total: 69990, status: 'completed', date: '2024-01-15' },
        { id: 2, customer: 'Мария Петрова', total: 139980, status: 'processing', date: '2024-01-14' },
        { id: 3, customer: 'Алексей Смирнов', total: 45990, status: 'shipped', date: '2024-01-14' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'shipped': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>

      {/* Статистика простым списком */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="primary" gutterBottom>
              {stats?.totalSales?.toLocaleString()} ₽
            </Typography>
            <Typography variant="body2">Общие продажи</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="secondary" gutterBottom>
              {stats?.totalOrders}
            </Typography>
            <Typography variant="body2">Всего заказов</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              {stats?.totalProducts}
            </Typography>
            <Typography variant="body2">Товаров в каталоге</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="info.main" gutterBottom>
              {stats?.totalUsers}
            </Typography>
            <Typography variant="body2">Зарегистрированных пользователей</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Последние заказы */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Последние заказы
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.total.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;