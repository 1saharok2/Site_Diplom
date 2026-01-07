import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  useMediaQuery,
  useTheme,
  alpha,
  Avatar,
  Badge,
  Tooltip,
  Tabs,
  Tab,
  TextareaAutosize
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Reply as ReplyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AccessTime as PendingIcon,
  Settings as ProcessingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Error as UrgentIcon,
  LowPriority as LowIcon,
  DoneAll as ResolvedIcon,
  Close as CloseIcon,
  NoteAdd as NoteIcon,
  ChatBubble as ChatIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

// =================================================================
// 🚀 1. ФУНКЦИИ СТАТУСА И ПРИОРИТЕТА
// =================================================================

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'info';
    case 'in_progress': return 'primary';
    case 'resolved': return 'success';
    case 'closed': return 'default';
    default: return 'default';
  }
};

const getStatusText = (status) => {
  const statusMap = {
    'new': 'Новое',
    'in_progress': 'В работе',
    'resolved': 'Решено',
    'closed': 'Закрыто'
  };
  return statusMap[status] || status;
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'new': return <EmailIcon fontSize="small" />;
    case 'in_progress': return <ProcessingIcon fontSize="small" />;
    case 'resolved': return <ResolvedIcon fontSize="small" />;
    case 'closed': return <CloseIcon fontSize="small" />;
    default: return <EmailIcon fontSize="small" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'primary';
    case 'low': return 'success';
    default: return 'default';
  }
};

const getPriorityText = (priority) => {
  const priorityMap = {
    'urgent': 'Срочно',
    'high': 'Высокий',
    'medium': 'Средний',
    'low': 'Низкий'
  };
  return priorityMap[priority] || priority;
};

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'urgent': return <UrgentIcon fontSize="small" />;
    case 'high': return <UrgentIcon fontSize="small" />;
    case 'medium': return <ProcessingIcon fontSize="small" />;
    case 'low': return <LowIcon fontSize="small" />;
    default: return <ProcessingIcon fontSize="small" />;
  }
};

// =================================================================
// 🚀 2. MOBILE TICKET CARD
// =================================================================

const MobileTicketCard = ({ ticket, handleMenuOpen, viewTicketDetails, updateTicketStatus, theme }) => {
  const statusColorKey = getStatusColor(ticket.status);
  const priorityColorKey = getPriorityColor(ticket.priority);
  
  const getBorderColor = () => {
    if (priorityColorKey === 'error') {
      return theme.palette.error.main;
    } else if (priorityColorKey === 'warning') {
      return theme.palette.warning.main;
    }
    return theme.palette.grey[400];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    }
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Card 
      sx={{ 
        mb: 2, 
        p: 2, 
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 2,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {ticket.ticket_number}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {ticket.subject}
          </Typography>
        </Box>
        <Box textAlign="right">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, ticket.id);
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box display="flex" gap={1} mt={1} mb={1}>
        <Chip
          icon={getStatusIcon(ticket.status)}
          label={getStatusText(ticket.status)}
          color={statusColorKey}
          variant="outlined"
          size="small"
        />
        <Chip
          icon={getPriorityIcon(ticket.priority)}
          label={getPriorityText(ticket.priority)}
          color={priorityColorKey}
          variant="outlined"
          size="small"
        />
      </Box>
      
      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>От:</strong> {ticket.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <strong>Email:</strong> {ticket.email}
      </Typography>
      {ticket.phone && (
        <Typography variant="body2" color="text.secondary">
          <strong>Телефон:</strong> {ticket.phone}
        </Typography>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        📅 {formatDate(ticket.created_at)}
      </Typography>
      
      <Box mt={2} display="flex" justifyContent="space-between" gap={1}>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<ViewIcon />} 
          onClick={() => viewTicketDetails(ticket)}
          fullWidth
        >
          Подробнее
        </Button>
        <Button 
          size="small" 
          variant="contained"
          onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
          disabled={ticket.status === 'in_progress'}
          color="primary"
          startIcon={<ReplyIcon />}
          fullWidth
        >
          Ответить
        </Button>
      </Box>
    </Card>
  );
};

// =================================================================
// 3. КОМПОНЕНТ ADMIN SUPPORT TICKETS
// =================================================================

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [responseText, setResponseText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  // Состояния для поиска и фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Загрузка обращений
  useEffect(() => {
    fetchTickets();
  }, []);

  // Фильтрация обращений
  const filterTickets = useCallback(() => {
    if (!tickets || !Array.isArray(tickets)) {
      setFilteredTickets([]);
      return;
    }

    let filtered = [...tickets];

    // Поиск
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket => {
        return (
          (ticket.ticket_number?.toLowerCase().includes(term)) ||
          (ticket.name?.toLowerCase().includes(term)) ||
          (ticket.email?.toLowerCase().includes(term)) ||
          (ticket.subject?.toLowerCase().includes(term)) ||
          (ticket.message?.toLowerCase().includes(term))
        );
      });
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Фильтр по приоритету
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Фильтр по активной вкладке
    if (activeTab !== 'all') {
      if (activeTab === 'new') {
        filtered = filtered.filter(ticket => ticket.status === 'new');
      } else if (activeTab === 'urgent') {
        filtered = filtered.filter(ticket => ticket.priority === 'urgent' && ticket.status !== 'resolved' && ticket.status !== 'closed');
      }
    }

    // Сортировка: сначала срочные, затем новые, затем по дате
    filtered.sort((a, b) => {
      // Приоритеты для сортировки
      const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
      const statusOrder = { 'new': 1, 'in_progress': 2, 'resolved': 3, 'closed': 4 };
      
      // Сначала по приоритету
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Затем по статусу
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Затем по дате (новые сверху)
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter, priorityFilter, activeTab]);

  // Применение фильтров при изменении зависимостей
  useEffect(() => {
    filterTickets();
  }, [filterTickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getSupportTickets();
      
      const ticketsArray = Array.isArray(response) 
        ? response 
        : (response && response.tickets ? response.tickets : []);
        
      setTickets(ticketsArray);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      if (!error.message.includes('401')) {
        setError('Не удалось загрузить обращения');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      handleMenuClose();
      handleMobileMenuClose();
      await adminService.updateSupportTicket(ticketId, { status });
      await fetchTickets();
      
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        setSuccessMessage(`Статус обращения ${ticket.ticket_number} обновлен`);
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Ошибка при обновлении статуса обращения');
    }
  };

  const updateTicketPriority = async (ticketId, priority) => {
    try {
      handleMenuClose();
      handleMobileMenuClose();
      await adminService.updateSupportTicket(ticketId, { priority });
      await fetchTickets();
      
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        setSuccessMessage(`Приоритет обращения ${ticket.ticket_number} обновлен`);
      }
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      setError('Ошибка при обновлении приоритета обращения');
    }
  };

  const sendResponse = async (ticketId) => {
    if (!responseText.trim()) {
      setError('Введите текст ответа');
      return;
    }

    try {
      await adminService.updateSupportTicket(ticketId, { 
        response: responseText,
        status: 'resolved'
      });
      
      setResponseText('');
      setReplyDialogOpen(false);
      await fetchTickets();
      
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        setSuccessMessage(`Ответ на обращение ${ticket.ticket_number} отправлен`);
      }
    } catch (error) {
      console.error('Error sending response:', error);
      setError('Ошибка при отправке ответа');
    }
  };

  const updateAdminNotes = async (ticketId) => {
    try {
      await adminService.updateSupportTicket(ticketId, { 
        admin_notes: adminNotes
      });
      
      setAdminNotes('');
      await fetchTickets();
      setSuccessMessage('Заметки обновлены');
    } catch (error) {
      console.error('Error updating admin notes:', error);
      setError('Ошибка при обновлении заметок');
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      await adminService.deleteSupportTicket(ticketId);
      setSuccessMessage('Обращение удалено');
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
      await fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setError('Ошибка при удалении обращения');
      setDeleteDialogOpen(false);
      setTicketToDelete(null);
    }
  };

  const handleDeleteClick = (ticket) => {
    setTicketToDelete(ticket);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
    setMenuAnchorEl(null);
  };

  const handleMenuOpen = (event, ticketId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTicketId(ticketId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTicketId(null);
  };

  const handleMobileMenuOpen = (event, ticketId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTicketId(ticketId);
  };

  const handleMobileMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTicketId(null);
  };

  const viewTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setAdminNotes(ticket.admin_notes || '');
    setDetailDialogOpen(true);
    handleMenuClose();
    handleMobileMenuClose();
  };

  const openReplyDialog = (ticket) => {
    setSelectedTicket(ticket);
    setReplyDialogOpen(true);
    handleMenuClose();
    handleMobileMenuClose();
  };

  // Статистика с useMemo для оптимизации
  const stats = useMemo(() => {
    const total = tickets.length;
    const newTickets = tickets.filter(ticket => ticket.status === 'new').length;
    const inProgress = tickets.filter(ticket => ticket.status === 'in_progress').length;
    const resolved = tickets.filter(ticket => ticket.status === 'resolved').length;
    const closed = tickets.filter(ticket => ticket.status === 'closed').length;
    const urgent = tickets.filter(ticket => ticket.priority === 'urgent' && ticket.status !== 'resolved' && ticket.status !== 'closed').length;

    return { total, new: newTickets, inProgress, resolved, closed, urgent };
  }, [tickets]);

  const statCards = [
    { title: 'Всего', count: stats.total, color: alpha(theme.palette.primary.main, 0.8), icon: '📊' },
    { title: 'Новые', count: stats.new, color: alpha(theme.palette.info.main, 0.8), icon: '🆕' },
    { title: 'В работе', count: stats.inProgress, color: alpha(theme.palette.warning.main, 0.8), icon: '⚙️' },
    { title: 'Решено', count: stats.resolved, color: alpha(theme.palette.success.main, 0.8), icon: '✅' },
    { title: 'Срочные', count: stats.urgent, color: alpha(theme.palette.error.main, 0.8), icon: '🚨' },
    { title: 'Закрыто', count: stats.closed, color: alpha(theme.palette.grey[600], 0.8), icon: '📭' },
  ];

  const formatMessage = (message) => {
    if (!message) return '';
    return message.replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>
          Загрузка обращений...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          💬 Обращения в поддержку
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchTickets}
          size={isMobile ? "small" : "medium"}
        >
          Обновить
        </Button>
      </Box>

      {/* Уведомления об ошибках */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: 2 }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Card 
              sx={{ 
                background: stat.color, 
                color: 'white', 
                borderRadius: 2, 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="h4" sx={{ lineHeight: 1, mb: 0.5 }}>
                  {stat.count}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1, opacity: 0.9 }}>
                  {stat.icon} {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Вкладки */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          <Tab 
            icon={<FilterIcon />} 
            label="Все" 
            value="all" 
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={stats.new} color="error"><EmailIcon /></Badge>} 
            label="Новые" 
            value="new" 
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={stats.urgent} color="error"><UrgentIcon /></Badge>} 
            label="Срочные" 
            value="urgent" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Панель поиска и фильтров */}
      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              placeholder="Поиск по номеру, имени, email или теме..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                    >
                      ✕
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                input={<OutlinedInput label="Статус" />}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="new">Новые</MenuItem>
                <MenuItem value="in_progress">В работе</MenuItem>
                <MenuItem value="resolved">Решено</MenuItem>
                <MenuItem value="closed">Закрыто</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                input={<OutlinedInput label="Приоритет" />}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="urgent">Срочный</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="low">Низкий</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setActiveTab('all');
                }}
                size={isMobile ? "small" : "medium"}
              >
                Сбросить
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={filterTickets}
                size={isMobile ? "small" : "medium"}
              >
                Применить
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Результаты поиска */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          Результаты: {filteredTickets.length} обращений
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Всего обращений: {tickets.length}
        </Typography>
      </Box>

      {/* Отображение обращений */}
      {filteredTickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {tickets.length === 0 ? 'Обращений пока нет' : 'Обращения по вашему запросу не найдены'}
          </Typography>
          {tickets.length > 0 && (
            <Button 
              variant="text" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setActiveTab('all');
              }}
            >
              Показать все обращения
            </Button>
          )}
        </Paper>
      ) : isMobile ? (
        // Мобильное представление
        <Box>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id}>
              <MobileTicketCard 
                ticket={ticket} 
                handleMenuOpen={handleMobileMenuOpen} 
                viewTicketDetails={viewTicketDetails}
                updateTicketStatus={updateTicketStatus}
                theme={theme}
              />
            </div>
          ))}
        </Box>
      ) : (
        // Десктопное представление
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>№ Обращения</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Клиент</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Тема</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Приоритет</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200, textAlign: 'center' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const isNew = ticket.status === 'new';
                const isUrgent = ticket.priority === 'urgent';
                
                return (
                  <TableRow 
                    key={ticket.id} 
                    hover
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      backgroundColor: isNew ? 'rgba(33, 150, 243, 0.04)' : 'inherit',
                      borderLeft: isUrgent ? `4px solid ${theme.palette.error.main}` : 'none'
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="bold">
                        {ticket.ticket_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {ticket.name ? ticket.name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                        <Box>
                          <Typography>
                            {ticket.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {ticket.email}
                          </Typography>
                          {ticket.phone && (
                            <Typography variant="body2" color="text.secondary">
                              📞 {ticket.phone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={ticket.subject} placement="top">
                        <Typography sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {ticket.subject}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(ticket.status)}
                        label={getStatusText(ticket.status)}
                        color={getStatusColor(ticket.status)}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getPriorityIcon(ticket.priority)}
                        label={getPriorityText(ticket.priority)}
                        color={getPriorityColor(ticket.priority)}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('ru-RU') : '—'}
                      <Typography variant="body2" color="text.secondary">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => viewTicketDetails(ticket)}
                          title="Просмотреть детали"
                          sx={{ color: 'primary.main' }}
                        >
                          <ViewIcon />
                        </IconButton>

                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => openReplyDialog(ticket)}
                          startIcon={<ReplyIcon />}
                          sx={{ minWidth: 'auto', px: 2 }}
                        >
                          Ответить
                        </Button>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, ticket.id)}
                          title="Дополнительные действия"
                        >
                          <MoreIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Меню дополнительных действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          if (selectedTicketId) updateTicketStatus(selectedTicketId, 'in_progress');
        }}>
          <ListItemIcon><ProcessingIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText>Взять в работу</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedTicketId) updateTicketStatus(selectedTicketId, 'resolved');
        }}>
          <ListItemIcon><ResolvedIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Отметить решенным</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          if (selectedTicketId) updateTicketStatus(selectedTicketId, 'closed');
        }}>
          <ListItemIcon><CloseIcon fontSize="small" color="default" /></ListItemIcon>
          <ListItemText>Закрыть</ListItemText>
        </MenuItem>

        <MenuItem>
          <ListItemIcon><NoteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Изменить приоритет</ListItemText>
          <Select
            size="small"
            defaultValue=""
            onChange={(e) => {
              if (selectedTicketId && e.target.value) {
                updateTicketPriority(selectedTicketId, e.target.value);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem value="urgent">Срочный</MenuItem>
            <MenuItem value="high">Высокий</MenuItem>
            <MenuItem value="medium">Средний</MenuItem>
            <MenuItem value="low">Низкий</MenuItem>
          </Select>
        </MenuItem>

        <MenuItem onClick={() => {
          const ticket = tickets.find(t => t.id === selectedTicketId);
          if (ticket) handleDeleteClick(ticket);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог с деталями обращения */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Обращение {selectedTicket?.ticket_number}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box>
              {/* Информация о клиенте */}
              <Typography variant="h6" gutterBottom color="primary.dark" sx={{ mb: 2 }}>
                Информация о клиенте
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Имя:</strong> {selectedTicket.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Email:</strong> {selectedTicket.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Телефон:</strong> {selectedTicket.phone || 'Не указан'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1}>
                    <Chip
                      icon={getStatusIcon(selectedTicket.status)}
                      label={getStatusText(selectedTicket.status)}
                      color={getStatusColor(selectedTicket.status)}
                      size="small"
                    />
                    <Chip
                      icon={getPriorityIcon(selectedTicket.priority)}
                      label={getPriorityText(selectedTicket.priority)}
                      color={getPriorityColor(selectedTicket.priority)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Дата создания:</strong> {new Date(selectedTicket.created_at).toLocaleString('ru-RU')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {selectedTicket.updated_at && (
                    <Typography><strong>Последнее обновление:</strong> {new Date(selectedTicket.updated_at).toLocaleString('ru-RU')}</Typography>
                  )}
                </Grid>
              </Grid>
              
              {/* Тема и сообщение */}
              <Typography variant="h6" gutterBottom color="primary.dark" sx={{ mb: 2 }}>
                Сообщение
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {selectedTicket.subject}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.message}
                </Typography>
              </Paper>

              {/* Ответ администратора (если есть) */}
              {selectedTicket.response && (
                <>
                  <Typography variant="h6" gutterBottom color="primary.dark" sx={{ mb: 2 }}>
                    Ответ администратора
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'success.light' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedTicket.response}
                    </Typography>
                    {selectedTicket.responded_at && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Ответ дан: {new Date(selectedTicket.responded_at).toLocaleString('ru-RU')}
                      </Typography>
                    )}
                  </Paper>
                </>
              )}

              {/* Заметки администратора */}
              <Typography variant="h6" gutterBottom color="primary.dark" sx={{ mb: 2 }}>
                Заметки администратора
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Введите заметки для этого обращения..."
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={() => updateAdminNotes(selectedTicket.id)}
                disabled={adminNotes === selectedTicket.admin_notes}
              >
                Сохранить заметки
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button 
            onClick={() => setDetailDialogOpen(false)} 
            variant="outlined"
          >
            Закрыть
          </Button>
          <Button 
            onClick={() => openReplyDialog(selectedTicket)}
            variant="contained"
            startIcon={<ReplyIcon />}
          >
            Ответить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог ответа на обращение */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Ответ на обращение {selectedTicket?.ticket_number}
        </DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Клиент: {selectedTicket.name} ({selectedTicket.email})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Тема: {selectedTicket.subject}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Сообщение клиента:</strong>
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50', maxHeight: 150, overflow: 'auto' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.message}
                </Typography>
              </Paper>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Ваш ответ:</strong>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Введите ваш ответ клиенту..."
                variant="outlined"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button 
            onClick={() => setReplyDialogOpen(false)} 
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={() => sendResponse(selectedTicket.id)}
            variant="contained"
            startIcon={<ReplyIcon />}
            disabled={!responseText.trim()}
          >
            Отправить ответ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle color="error">
          ❗ Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить обращение <strong>{ticketToDelete?.ticket_number}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Клиент: {ticketToDelete?.name} ({ticketToDelete?.email})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Тема: {ticketToDelete?.subject}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Это действие нельзя отменить!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => deleteTicket(ticketToDelete.id)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление об успехе */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSupportTickets;