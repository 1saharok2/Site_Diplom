// context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
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

  // Загрузка корзины из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: items });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  const loadCart = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const cartItems = await cartService.getCart(currentUser.id);
      dispatch({ type: 'SET_CART', payload: cartItems || [] });
      
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [currentUser]);

  const addToCart = async (productId, quantity = 1) => {
    console.log('🛒 addToCart called:', { productId, quantity, currentUser });

    if (!currentUser) {
      throw new Error('Необходимо авторизоваться');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const newItem = await cartService.addToCart(currentUser.id, productId, quantity);

      const existingItemIndex = state.items.findIndex(
        item => item.product_id === productId
      );

      if (existingItemIndex >= 0) {
        dispatch({ type: 'UPDATE_ITEM', payload: newItem });
      } else {
        dispatch({ type: 'ADD_ITEM', payload: newItem });
      }

      return newItem;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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

  const removeFromCart = async (cartItemId) => {
    try {
      await cartService.removeFromCart(cartItemId);
      dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

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