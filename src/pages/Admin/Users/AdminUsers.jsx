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
  Button
} from '@mui/material';
import { adminService } from '../../../services/adminService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]); // Всегда массив по умолчанию
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Загрузка пользователей...');
      
      // Получаем данные
      const response = await adminService.getUsers();
      console.log('Ответ от сервера:', response);
      
      // ✅ МНОГОУРОВНЕВАЯ ЗАЩИТА ОТ UNDEFINED
      let usersData = [];
      
      if (Array.isArray(response)) {
        // Если response уже массив
        usersData = response;
      } else if (response && Array.isArray(response.users)) {
        // Если response = { users: [] }
        usersData = response.users;
      } else if (response && Array.isArray(response.data)) {
        // Если response = { data: [] }
        usersData = response.data;
      }
      
      console.log('Извлеченные пользователи:', usersData);
      setUsers(usersData);
      
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setError(error.message || 'Ошибка при загрузке пользователей');
      setUsers([]); // ✅ Всегда устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      fetchUsers(); // Обновляем список
    } catch (error) {
      setError('Ошибка при обновлении роли пользователя');
    }
  };

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
                <TableCell>Дата регистрации</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* ✅ ГАРАНТИРОВАННАЯ ЗАЩИТА ОТ UNDEFINED */}
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id || Math.random()}>
                    <TableCell>#{user.id}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      {user.first_name || ''} {user.last_name || ''}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role || 'customer'}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' ? (
                        <Button
                          size="small"
                          onClick={() => updateUserRole(user.id, 'admin')}
                        >
                          Сделать админом
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          onClick={() => updateUserRole(user.id, 'customer')}
                        >
                          Убрать админку
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      {loading ? 'Загрузка...' : 'Пользователей не найдено'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Button 
          variant="outlined" 
          onClick={fetchUsers}
          disabled={loading}
        >
          Обновить список
        </Button>
      </Box>
    </Box>
  );
};

export default AdminUsers;