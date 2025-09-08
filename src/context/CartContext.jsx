import React, { createContext, useContext, useReducer } from 'react';
import { apiService } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      // Логика добавления в локальное состояние
      return { ...state, items: [...state.items, action.payload] };
    
    case 'SYNC_CART':
      // Синхронизация с бэкендом
      return { ...state, items: action.payload };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Отправляем на сервер если пользователь авторизован
        await apiService.addToCart({ productId: product.id, quantity }, token);
      }
      
      // Обновляем локальное состояние
      dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ cart: state, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};