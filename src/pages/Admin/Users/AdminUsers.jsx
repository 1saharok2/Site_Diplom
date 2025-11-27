// pages/Admin/Users/AdminUsers.jsx (АДАПТИРОВАННЫЙ КОД)
import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme,
  InputAdornment,
  Switch,
  Divider,
} from '@mui/material';
import {
  Refresh,
  Delete,
  Edit,
  Visibility,
  Search,
  Person,
  Email,
  CalendarToday,
  Security,
  Phone,
  Lock
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  // Удаляем все, кроме цифр
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  // Предполагаем формат: +7 (XXX) XXX-XX-XX
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  // Если не удалось форматировать, возвращаем как есть
  return phoneNumber;
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  
  // 🔥 Обновленное состояние для диалога: теперь включает isViewMode
  const [managementDialog, setManagementDialog] = useState({
    open: false,
    user: null,
    formData: null,
    isViewMode: false, // 🔥 НОВОЕ СОСТОЯНИЕ
  });

  const theme = useTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  const filterUsers = useCallback(() => {
    let filtered = users.filter(user =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => 
        selectedStatus === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const usersData = await adminService.getUsers();
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      setError(error.message || 'Ошибка при загрузке пользователей');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminService.deleteUser(deleteDialog.user.id);
      setUsers(users.filter(user => user.id !== deleteDialog.user.id));
      setSnackbar({ 
        open: true, 
        message: 'Пользователь успешно удален', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Delete error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Ошибка при удалении пользователя', 
        severity: 'error' 
      });
    } finally {
      setDeleteDialog({ open: false, user: null });
    }
  };

  // 🔥 АДАПТИРОВАНО: Устанавливает режим редактирования (isViewMode: false)
  const handleEditUser = (user) => {
    if (!user) return;

    setManagementDialog({
      open: true,
      user: user,
      formData: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        is_active: user.is_active || false
      },
      isViewMode: false, // Режим редактирования
    });
  };

  // 🔥 НОВЫЙ ОБРАБОТЧИК: Устанавливает режим просмотра (isViewMode: true)
  const handleViewUser = (user) => {
    if (!user) return;

    setManagementDialog({
      open: true,
      user: user,
      formData: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'customer',
        is_active: user.is_active || false
      },
      isViewMode: true, // Режим просмотра
    });
  };

  const handleUpdateUser = async () => {
    if (!managementDialog.user || !managementDialog.formData) {
      setSnackbar({ 
        open: true, 
        message: 'Ошибка: данные пользователя не загружены', 
        severity: 'error' 
      });
      return;
    }

    try {
      const updatedUser = await adminService.updateUser(
        managementDialog.user.id,
        managementDialog.formData
      );
      
      setUsers(users.map(user => 
        user.id === managementDialog.user.id ? updatedUser : user
      ));
      
      setSnackbar({ 
        open: true, 
        message: 'Пользователь успешно обновлен', 
        severity: 'success' 
      });
      setManagementDialog({ open: false, user: null, formData: null, isViewMode: false });
    } catch (error) {
      console.error('Update error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Ошибка при обновлении пользователя', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'manager': return 'secondary';
      case 'moderator': return 'warning';
      default: return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'moderator': return 'Модератор';
      case 'customer': return 'Покупатель';
      default: return role;
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
    <Box sx={{ p: 2, ml: 0 }}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Управление пользователями
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchUsers}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      {/* Оставлена без изменений */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* ... (блоки статистики) ... */}
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {users.length}
              </Typography>
              <Typography variant="body2">Всего пользователей</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {users.filter(u => u.is_active).length}
              </Typography>
              <Typography variant="body2">Активных</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {users.filter(u => u.role === 'admin').length}
              </Typography>
              <Typography variant="body2">Администраторов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {filteredUsers.length}
              </Typography>
              <Typography variant="body2">Отфильтровано</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Панель поиска и фильтров */}
      {/* Оставлена без изменений */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Поиск пользователей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              fullWidth
              select
              label="Роль"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            >
              <MenuItem value="all">Все роли</MenuItem>
              <MenuItem value="admin">Администратор</MenuItem>
              <MenuItem value="manager">Менеджер</MenuItem>
              <MenuItem value="moderator">Модератор</MenuItem>
              <MenuItem value="customer">Покупатель</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={4}>
            <TextField
              fullWidth
              select
              label="Статус"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="active">Активные</MenuItem>
              <MenuItem value="inactive">Неактивные</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Таблица пользователей */}
      <Paper sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        {filteredUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Пользователи не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Попробуйте изменить параметры поиска или фильтрации
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: alpha(theme.palette.primary?.main || '#000000', 0.05),
                }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Пользователь</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Роль</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Дата регистрации</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    sx={{ 
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {user?.first_name || user?.name || 'Не указано'} {user?.last_name || ''}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: #{user?.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        {user?.email || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleText(user?.role)}
                        color={getRoleColor(user?.role)}
                        variant="outlined"
                        size="small"
                        icon={<Security fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user?.is_active ? 'Активен' : 'Неактивен'}
                        color={user?.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" />
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => user && handleViewUser(user)} // 🔥 ИСПОЛЬЗУЕМ НОВЫЙ ОБРАБОТЧИК ДЛЯ ПРОСМОТРА
                          sx={{
                            color: 'info.main',
                            '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                          }}
                          title="Просмотреть профиль"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => user && handleEditUser(user)}
                          sx={{
                            color: 'warning.main',
                            '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.1) }
                          }}
                          title="Редактировать пользователя"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => user && setDeleteDialog({ open: true, user })}
                          sx={{
                            color: 'error.main',
                            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                          }}
                          title="Удалить пользователя"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      {/* Оставлен без изменений */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          ⚠️ Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" gutterBottom>
            Вы уверены, что хотите удалить пользователя?
          </Typography>
          {deleteDialog.user && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.error.main, 0.1), borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {deleteDialog.user.first_name || deleteDialog.user.name} {deleteDialog.user.last_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {deleteDialog.user.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Роль: {getRoleText(deleteDialog.user.role)}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Это действие нельзя отменить!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, user: null })}
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔥 ПЕРЕИМЕНОВАННЫЙ И АДАПТИРОВАННЫЙ ДИАЛОГ УПРАВЛЕНИЯ */}
      <UserManagementDialog
        open={managementDialog.open}
        onClose={() => setManagementDialog({ open: false, user: null, formData: null, isViewMode: false })}
        formData={managementDialog.formData}
        setFormData={(newFormData) => setManagementDialog(prev => ({ ...prev, formData: newFormData }))}
        onSave={handleUpdateUser}
        isViewMode={managementDialog.isViewMode} // 🔥 Передача режима
        user={managementDialog.user}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={handleCloseSnackbar}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// 🔥 НОВЫЙ/ПЕРЕИМЕНОВАННЫЙ КОМПОНЕНТ ДИАЛОГА
const UserManagementDialog = ({ open, onClose, formData, setFormData, onSave, isViewMode, user }) => {

  const handleChange = (field, value) => {
    if (isViewMode) return; // Запрет изменений в режиме просмотра
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTitle = () => {
    if (isViewMode) return '👁️ Просмотр пользователя';
    return '✏️ Редактирование пользователя';
  };

  const getTitleBg = () => {
    if (isViewMode) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  // 🚨 ПРЕДУПРЕЖДЕНИЕ: В режиме просмотра мы используем данные из `user` напрямую, 
  // так как `formData` предназначена для редактирования.

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: getTitleBg(),
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        py: 2
      }}>
        {getTitle()}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {user && ( // Используем user для режима просмотра
          <Box sx={{ p: 3, pb: 2 }}>
            
            {/* Основная информация */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>
                Основная информация
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Имя"
                    value={isViewMode ? user.first_name || user.name || 'N/A' : formData?.first_name || ''}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    size="small"
                    InputProps={{
                      readOnly: isViewMode, // 🔥 Только для чтения
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Фамилия"
                    value={isViewMode ? user.last_name || 'N/A' : formData?.last_name || ''}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    size="small"
                    InputProps={{
                      readOnly: isViewMode, // 🔥 Только для чтения
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Контактная информация */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>
                Контактная информация
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={isViewMode ? user.email || 'N/A' : formData?.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      readOnly: isViewMode, // 🔥 Только для чтения
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Телефон"
                    // Используем форматированный номер для отображения
                    value={isViewMode ? formatPhoneNumber(user.phone) : formData?.phone || ''}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (input.length <= 15) { // Ограничиваем длину при редактировании
                        handleChange('phone', input);
                      }
                    }}
                    placeholder="+7 (999) 999-99-99"
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      readOnly: isViewMode, // 🔥 Только для чтения
                    }}
                    // Валидация отображается только в режиме редактирования
                    error={!isViewMode && formData?.phone?.length > 15}
                    helperText={
                      !isViewMode && formData?.phone?.length > 15 
                        ? 'Превышено максимальное количество символов' 
                        : isViewMode ? null : 'Формат: +7 (XXX) XXX-XX-XX'
                    }
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Настройки доступа */}
            <Box sx={{ 
              p: 2, 
              backgroundColor: isViewMode ? 'primary.lightest' : 'grey.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: isViewMode ? 'primary.main' : 'grey.200'
            }}>
              <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>
                Настройки доступа
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Роль пользователя"
                    value={isViewMode ? user.role : formData?.role || 'customer'}
                    onChange={(e) => handleChange('role', e.target.value)}
                    size="small"
                    disabled={isViewMode} // 🔥 Отключаем SELECT в режиме просмотра
                    InputProps={{
                        readOnly: isViewMode,
                    }}
                    SelectProps={{
                      renderValue: (selected) => {
                        const roles = {
                          'customer': '👤 Покупатель',
                          'moderator': '🛡️ Модератор',
                          'manager': '📊 Менеджер',
                          'admin': '⚙️ Администратор'
                        };
                        return roles[selected] || selected;
                      }
                    }}
                  >
                    <MenuItem value="customer">👤 Покупатель</MenuItem>
                    <MenuItem value="moderator">🛡️ Модератор</MenuItem>
                    <MenuItem value="manager">📊 Менеджер</MenuItem>
                    <MenuItem value="admin">⚙️ Администратор</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'white'
                  }}>
                    <Box>
                      <Typography variant="body2" fontWeight="500">
                        Статус аккаунта
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(isViewMode ? user.is_active : formData?.is_active) 
                            ? 'Активен • Может войти в систему' 
                            : 'Неактивен • Доступ заблокирован'}
                      </Typography>
                    </Box>
                    {isViewMode ? ( // 🔥 В режиме просмотра показываем только чип
                        <Chip
                            label={(isViewMode ? user.is_active : formData?.is_active) ? 'Активен' : 'Неактивен'}
                            color={(isViewMode ? user.is_active : formData?.is_active) ? 'success' : 'error'}
                            icon={<Lock fontSize="small" />}
                        />
                    ) : (
                        <Switch
                            checked={formData?.is_active || false}
                            onChange={(e) => handleChange('is_active', e.target.checked)}
                            color="success"
                        />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Дата регистрации */}
            {user?.created_at && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Дата регистрации: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 0,
        gap: 2,
        justifyContent: 'center'
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2, 
            px: 4,
            py: 1,
            minWidth: 120,
            borderColor: 'grey.300',
            '&:hover': {
              borderColor: 'grey.400',
              backgroundColor: 'grey.50'
            }
          }}
        >
          {isViewMode ? 'Закрыть' : 'Отмена'}
        </Button>
        {!isViewMode && ( // 🔥 Скрываем кнопку "Сохранить" в режиме просмотра
          <Button 
            onClick={onSave}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 4,
              py: 1,
              minWidth: 180,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Сохранить изменения
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminUsers;