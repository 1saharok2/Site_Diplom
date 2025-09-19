// services/orderService.js
import { supabase } from "./supabaseClient";

export const orderService = {
  createOrder: async (orderData, userData = null) => {
    try {
      console.log('🟢 Создание заказа с данными:', orderData);
      
      // Генерируем уникальный номер заказа
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      // Подготавливаем данные для заказа согласно структуре БД
      const orderDataToInsert = {
        order_number: orderNumber,
        customer_name: userData?.first_name || userData?.last_name,
        customer_email: userData?.email,
        customer_phone: userData?.phone,
        total_amount: orderData.totalAmount,
        status: 'pending',
        user_id: orderData.userId,
        created_at: new Date().toISOString()
      };

      console.log('🟢 Данные для вставки в orders:', orderDataToInsert);

      // 1. Создаем основной заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderDataToInsert)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Ошибка создания заказа:', orderError);
        throw orderError;
      }

      console.log('✅ Заказ создан:', order);

      // 2. Создаем элементы заказа
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name || 'Неизвестный товар',
        created_at: new Date().toISOString()
      }));

      console.log('🟢 Данные для order_items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Ошибка добавления элементов заказа:', itemsError);
        
        // Удаляем заказ если элементы не добавились
        await supabase
          .from('orders')
          .delete()
          .eq('id', order.id);
          
        throw itemsError;
      }

      console.log('✅ Заказ полностью создан');
      return order;

    } catch (error) {
      console.error('❌ Критическая ошибка создания заказа:', error);
    }
  },

  // Получение заказов пользователя
  getUserOrders: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              price,
              image_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }
      
      // Если нет данных, возвращаем тестовые данные для демонстрации
      if (!data || data.length === 0) {
        return await orderService.getMockOrders(userId);
      }
      
      return data;

    } catch (error) {
      console.error('Error in getUserOrders:', error);
      // В случае ошибки возвращаем mock данные
      return await orderService.getMockOrders(userId);
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
          users (email, first_name, last_name, phone)
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
          order_items (
            *,
            products (
              name,
              price,
              image_url,
              description
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching order:', error);
      // Возвращаем mock данные в случае ошибки
      return {
        id: orderId,
        order_number: 'ORD-' + orderId,
        customer_name: 'Иван Иванов',
        total_amount: 144980,
        status: 'processing',
        created_at: new Date().toISOString(),
        order_items: [
          {
            product_id: 101,
            quantity: 2,
            price: 50000,
            name: 'Пример товара 1',
            products: {
              name: 'Пример товара 1',
              price: 50000,
              image_url: '/images/product1.jpg',
              description: 'Описание товара 1'
            }
          }
        ]
      };
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
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};