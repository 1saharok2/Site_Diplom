// context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import { getUserUuid } from '../utils/authUtils';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'SET_CART':
      newState = {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
      break;
    case 'ADD_ITEM':
      newState = {
        ...state,
        items: [...state.items, action.payload]
      };
      break;
    case 'UPDATE_ITEM':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
      break;
    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      break;
    case 'CLEAR_CART':
      newState = {
        ...state,
        items: []
      };
      break;
    case 'SET_LOADING':
      newState = {
        ...state,
        loading: action.payload
      };
      break;
    case 'SET_ERROR':
      newState = {
        ...state,
        error: action.payload,
        loading: false
      };
      break;
    default:
      return state;
  }
  if (newState) {
    localStorage.setItem('cart_items', JSON.stringify(newState.items));
  }
  
  return newState;
};


export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null
  });
  const { currentUser } = useAuth();

  const loadCart = useCallback(async (forceRefresh = false) => {
    if (!currentUser) return;
    const userId = currentUser.uuid || currentUser.id; // UUID
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const items = await cartService.getCart(userId, forceRefresh);
      dispatch({ type: 'SET_CART', payload: items });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [currentUser]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const userUuid = getUserUuid();
      await cartService.addToCart(userUuid, productId, quantity);
      // После успешного добавления принудительно загружаем корзину с сервера
      await loadCart(true);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      await loadCart(true); // даже при ошибке загружаем, чтобы синхронизировать
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadCart]);

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const updatedItem = await cartService.updateCartItem(cartItemId, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: updatedItem });
      return updatedItem;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const removeFromCart = useCallback(async (cartItemId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const userUuid = getUserUuid(); 
      console.log('🗑️ removeFromCart в контексте:', { cartItemId, userUuid });
      
      await cartService.removeFromCart(cartItemId, userUuid);
      dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
      await loadCart(true);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      await loadCart(true);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadCart]);

  const clearCart = async () => {
    if (!currentUser) return;
    
    try {
      await cartService.clearCart(currentUser.id);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const getTotalPrice = () => {
    return cartService.getCartTotal(state.items);
  };

  const getItemsCount = () => {
    return cartService.getCartItemsCount(state.items);
  };

  useEffect(() => {
    if (currentUser) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [currentUser, loadCart]);

  const value = {
    items: state.items,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemsCount,
    refreshCart: loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};