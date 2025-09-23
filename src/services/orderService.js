// services/orderService.js
import { supabase } from "./supabaseClient";

const getUserProfile = async (userId) => {
  try {
    // Если в profiles нет данных, пробуем получить из таблицы users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!userError && user) {
      return user;
    }

    // Если ничего не найдено, возвращаем null
    return null;
    
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return null;
  }
};

export const orderService = {
  createOrder: async (orderData, userData = null) => {
    try {
      console.log('🟢 Создание заказа с данными:', orderData);
      console.log('🟢 Данные пользователя:', userData);
      
      let userProfile = userData;
      if (userData?.id) {
        userProfile = await getUserProfile(userData.id) || userData;
      }      

      // Генерируем уникальный номер заказа
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
      
      let customerName = 'Клиент';

      if (userProfile) {
        console.log('🔍 Анализ userProfile для определения имени:');

        // Создаем массив кандидатов, исключая служебные значения
        const nameCandidates = [
          userProfile.first_name,
          userProfile.last_name, 
          userProfile.first_name && userProfile.last_name ? `${userProfile.first_name} ${userProfile.last_name}` : null,
          userProfile.name,
          userProfile.full_name,
          userProfile.display_name,
          userProfile.username,
          userProfile.email ? userProfile.email.split('@')[0] : null
        ].filter(candidate => 
          candidate && 
          !['admin', 'user', 'client', 'guest', 'test'].includes(candidate.toLowerCase())
        );

        console.log('🎯 Кандидаты на имя (после фильтрации):', nameCandidates);

        // Выбираем первый подходящий вариант
        if (nameCandidates.length > 0) {
          customerName = nameCandidates[0];
        } 
        // Если все кандидаты отфильтровались, используем email
        else if (userProfile.email) {
          customerName = userProfile.email.split('@')[0];
        }
        // Если email тоже не подходит, создаем имя из ID
        else if (userProfile.id) {
          customerName = `User${userProfile.id.slice(-6)}`;
        }
      }

      console.log('✅ Финальное имя клиента:', customerName);     
      // Подготавливаем данные для заказа согласно структуре БД
      const orderDataToInsert = {
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: userProfile?.email || userData?.email || '',
        customer_phone: userProfile?.phone || userData?.phone || '',
        total_amount: orderData.totalAmount,
        status: 'pending',
        user_id: orderData.userId,
        created_at: new Date().toISOString()
      };

      console.log('🟢 Данные для вставки в orders:', orderDataToInsert);

      // 1. Создаем основной заказ
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderDataToInsert])
        .select()
        .single();

      if (orderError) {
        console.error('❌ Ошибка создания заказа:', orderError);
        throw new Error(orderError.message || 'Ошибка создания заказа');
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
          
        throw new Error(itemsError.message || 'Ошибка добавления товаров в заказ');
      }

      console.log('✅ Заказ полностью создан');
      return order;

    } catch (error) {
      console.error('❌ Критическая ошибка создания заказа:', error);
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
          order_items (
            *,
            products (
              id,
              name,
              price,
              image_url,
              slug
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        // В случае ошибки возвращаем пустой массив вместо вызова несуществующей функции
        return [];
      }
      
      // Если нет данных, возвращаем пустой массив
      return data || [];

    } catch (error) {
      console.error('Error in getUserOrders:', error);
      // В случае ошибки возвращаем пустой массив
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
          users (email, first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      return data || [];

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

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }
      return data;

    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
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