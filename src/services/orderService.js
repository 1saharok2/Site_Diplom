// services/orderService.js
import { supabase } from "./supabaseClient";

export const orderService = {

  // Создание заказа
createOrder: async (orderData) => {
  try {
    console.log('🟢 orderService.createOrder вызван', orderData);
    
    // Временная заглушка для тестирования
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testOrder = {
      id: Math.random().toString(36).substr(2, 9),
      order_number: 'ORD-TEST-' + Date.now(),
      status: 'pending',
      total_amount: orderData.totalAmount,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ Тестовый заказ создан:', testOrder);
    return testOrder;
    
  } catch (error) {
    console.error('❌ Ошибка в createOrder:', error);
    throw error;
  }
},

  // Получение заказов пользователя
  getUserOrders: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*,
            products (*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Получение всех заказов (для админа)
  getAllOrders: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*,
            products (*)
          ),
          users!inner (email, first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Получение деталей заказа
  getOrderById: async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*,
            products (*)
          ),
          users (email, first_name, last_name, phone),
          stores (name, address, phone),
          employees (first_name, last_name, position)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Обновление статуса заказа
  updateOrderStatus: async (orderId, status) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Назначение сотрудника на заказ
  assignEmployeeToOrder: async (orderId, employeeId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          employee_id: employeeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error assigning employee:', error);
      throw error;
    }
  }
};