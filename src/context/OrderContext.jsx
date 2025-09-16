// context/OrderContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

// Редьюсер для управления состоянием заказов
const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? state.error : null
      };

    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'SET_USER_ORDERS':
      return {
        ...state,
        userOrders: action.payload,
        loading: false,
        error: null
      };

    case 'SET_ALL_ORDERS':
      return {
        ...state,
        allOrders: action.payload,
        loading: false,
        error: null
      };

    case 'ADD_ORDER':
      return {
        ...state,
        userOrders: [action.payload, ...state.userOrders],
        loading: false,
        error: null
      };

    case 'UPDATE_ORDER':
      return {
        ...state,
        userOrders: state.userOrders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
        allOrders: state.allOrders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
        loading: false,
        error: null
      };

    case 'SET_SELECTED_ORDER':
      return {
        ...state,
        selectedOrder: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'CLEAR_ORDERS':
      return {
        ...state,
        userOrders: [],
        selectedOrder: null
      };

    default:
      return state;
  }
};

const initialState = {
  userOrders: [],    // Заказы текущего пользователя
  allOrders: [],     // Все заказы (для админа)
  selectedOrder: null, // Выбранный заказ для деталей
  loading: false,
  error: null
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  const { currentUser, isAdmin } = useAuth();

  // Загрузка заказов пользователя
  const loadUserOrders = async () => {
    if (!currentUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const orders = await orderService.getUserOrders(currentUser.id);
      dispatch({ type: 'SET_USER_ORDERS', payload: orders });
    } catch (error) {
      console.error('Error loading user orders:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Ошибка при загрузке заказов' 
      });
    }
  };

  // Загрузка всех заказов (для админа)
  const loadAllOrders = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const orders = await orderService.getAllOrders();
      dispatch({ type: 'SET_ALL_ORDERS', payload: orders });
    } catch (error) {
      console.error('Error loading all orders:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Ошибка при загрузке заказов' 
      });
    }
  };

  // Создание нового заказа
  const createOrder = async (orderData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const order = await orderService.createOrder(orderData);
      dispatch({ type: 'ADD_ORDER', payload: order });
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Ошибка при создании заказа' 
      });
      throw error;
    }
  };

  // Получение деталей заказа
  const getOrderDetails = async (orderId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const order = await orderService.getOrderById(orderId);
      dispatch({ type: 'SET_SELECTED_ORDER', payload: order });
      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Ошибка при загрузке деталей заказа' 
      });
      throw error;
    }
  };

  // Обновление статуса заказа
  const updateOrderStatus = async (orderId, status) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedOrder = await orderService.updateOrderStatus(orderId, status);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Ошибка при обновлении статуса заказа' 
      });
      throw error;
    }
  };

  // Назначение сотрудника на заказ
  const assignEmployeeToOrder = async (orderId, employeeId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedOrder = await orderService.assignEmployeeToOrder(orderId, employeeId);
      dispatch({ type: 'UPDATE_ORDER', payload: updatedOrder });
      return updatedOrder;
    } catch (error) {
      console.error('Error assigning employee to order:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Ошибка при назначении сотрудника' 
      });
      throw error;
    }
  };

  // Очистка ошибок
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Очистка заказов
  const clearOrders = () => {
    dispatch({ type: 'CLEAR_ORDERS' });
  };

  // Автоматическая загрузка заказов при изменении пользователя
  useEffect(() => {
    if (currentUser) {
      loadUserOrders();
      
      // Если пользователь админ, загружаем все заказы
      if (isAdmin) {
        loadAllOrders();
      }
    } else {
      clearOrders();
    }
  }, [currentUser, isAdmin]);

  const value = {
    // Состояние
    userOrders: state.userOrders,
    allOrders: state.allOrders,
    selectedOrder: state.selectedOrder,
    loading: state.loading,
    error: state.error,

    // Методы
    createOrder,
    getOrderDetails,
    updateOrderStatus,
    assignEmployeeToOrder,
    loadUserOrders,
    loadAllOrders,
    clearError,
    clearOrders,

    // Вспомогательные методы
    getOrderById: (orderId) => 
      state.userOrders.find(order => order.id === orderId) ||
      state.allOrders.find(order => order.id === orderId),
    
    getOrdersByStatus: (status, isAdmin = false) => 
      (isAdmin ? state.allOrders : state.userOrders)
        .filter(order => order.status === status),
    
    hasOrders: state.userOrders.length > 0,
    hasAllOrders: state.allOrders.length > 0
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Хук для использования контекста
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};