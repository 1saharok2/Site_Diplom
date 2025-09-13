import { apiService } from './api';

const API_BASE = 'http://localhost:5000/api';

export const orderService = {
  // Создание заказа
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Ошибка создания заказа');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Получение заказов пользователя
  getUserOrders: async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка получения заказов');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Получение всех заказов (для админа)
  getAllOrders: async () => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка получения заказов');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Обновление статуса заказа
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления заказа');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Отмена заказа
  cancelOrder: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка отмены заказа');
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling order:', error);
      throw error;
    }
  }
};