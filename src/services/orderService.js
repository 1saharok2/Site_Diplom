import { apiService } from './api';

export const orderService = {
  createOrder: async (orderData, userData = null) => {
    try {
      const order = await apiService.post('/orders', orderData);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  getUserOrders: async (userId) => {
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