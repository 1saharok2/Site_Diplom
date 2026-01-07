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
    try {
      console.log(`📥 Запрос заказов пользователя ${userId}`);
      
      const response = await apiService.get(`/orders/user/${userId}`);
      console.log('✅ Ответ заказов:', response);
      
      // ⚠️ ПРАВИЛЬНАЯ ОБРАБОТКА ОТВЕТА
      // Ответ имеет структуру: {success: true, data: Array(30)}
      if (response && response.success !== false && response.data) {
        console.log(`📊 Найдено заказов: ${response.data.length}`);
        return response.data; // ← Возвращаем массив из data
      } else {
        console.warn('⚠️ Неверная структура ответа или нет заказов:', response);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки заказов:', error);
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
      console.log(`📋 Запрос деталей заказа ${orderId}`);      
      const response = await apiService.get(`/order_details.php?id=${orderId}`);
      console.log('✅ Ответ деталей заказа:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения заказа:', error);
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