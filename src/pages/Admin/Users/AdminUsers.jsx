import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Snackbar
} from '@mui/material';
import { adminService } from '../../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Загрузка пользователей...');
      
      // Проверяем наличие токена
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Требуется авторизация. Пожалуйста, войдите в систему.');
        setUsers([]);
        return;
      }

      // Получаем данные через adminService
      const usersData = await adminService.getUsers();
      console.log('📦 Получены пользователи:', usersData);
      
      // ✅ Всегда устанавливаем массив (даже если пустой)
      setUsers(Array.isArray(usersData) ? usersData : []);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки пользователей:', error);
      setError(error.message || 'Ошибка при загрузке пользователей');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      console.log(`🔄 Обновление роли пользователя ${userId} на ${newRole}`);
      
      await adminService.updateUserRole(userId, newRole);
      
      // Обновляем локальное состояние вместо полной перезагрузки
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, role: newRole }
            : user
        )
      );
      
      setSnackbar({ 
        open: true, 
        message: `Роль пользователя успешно обновлена на "${newRole}"` 
      });
      
    } catch (error) {
      console.error('❌ Ошибка при обновлении роли:', error);
      setError(error.message || 'Ошибка при обновлении роли пользователя');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 🔍 ДЕБАГГИНГ: Проверяем данные в консоли
  useEffect(() => {
    console.log('📊 Текущие users:', users);
    console.log('⏳ Loading:', loading);
    console.log('❌ Error:', error);
  }, [users, loading, error]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Загрузка пользователей...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление пользователями
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchUsers}
              disabled={loading}
            >
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* ✅ ГАРАНТИРОВАННАЯ ЗАЩИТА ОТ ОШИБОК */}
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id || `user-${Math.random()}`}>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        #{user.id || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      {user.first_name || user.name || 'Не указано'} {user.last_name || ''}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'customer'}
                        color={
                          user.role === 'admin' ? 'primary' : 
                          user.role === 'manager' ? 'secondary' : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? 'Активен' : 'Неактивен'}
                        color={user.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => updateUserRole(user.id, 'admin')}
                          disabled={loading}
                        >
                          Сделать админом
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          onClick={() => updateUserRole(user.id, 'customer')}
                          disabled={loading}
                        >
                          Убрать админку
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {error ? 'Ошибка загрузки пользователей' : 'Пользователей не найдено'}
                    </Typography>
                    {!error && (
                      <Button 
                        variant="outlined" 
                        onClick={fetchUsers}
                        sx={{ mt: 2 }}
                      >
                        Попробовать снова
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          onClick={fetchUsers}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          Обновить список
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => console.log('Текущие пользователи:', users)}
        >
          Debug (консоль)
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default AdminUsers;