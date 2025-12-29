import { apiService } from './api';

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const order = await apiService.post('/orders.php', orderData);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getUserOrders: async (userId) => {
    // 1. Проверяем, что ID существует и он не равен 0
    if (!userId || userId === 0 || userId === '0') {
      console.warn('getUserOrders: запрос отменен, некорректный ID пользователя:', userId);
      return []; // Возвращаем пустой массив без вызова API
    }

    try {
      const orders = await apiService.get(`/orders/user/${userId}`);
      return orders || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  getAllOrders: async () => {
    try {
      const orders = await apiService.get('/admin/orders');
      return orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getOrderById: async (orderId) => {
    try {
      const order = await apiService.get(`/orders/${orderId}`);
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const order = await apiService.put(`/admin/orders/${orderId}/status`, { status });
      return order;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};