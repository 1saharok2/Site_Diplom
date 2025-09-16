// context/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null
  });
  const { currentUser } = useAuth();

  // Загружаем корзину при изменении пользователя
  useEffect(() => {
    if (currentUser) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [currentUser]);

  const loadCart = async () => {
    if (!currentUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartItems = await cartService.getCart(currentUser.id);
      dispatch({ type: 'SET_CART', payload: cartItems });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

const addToCart = async (productId, quantity = 1) => {
  console.log('🛒 addToCart called:', { productId, quantity, currentUser });
  
  if (!currentUser) {
    throw new Error('Необходимо авторизоваться');
  }

  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    console.log('📦 Calling cartService.addToCart...');
    
    const newItem = await cartService.addToCart(currentUser.id, productId, quantity);
    console.log('✅ cartService response:', newItem);
    
    // Проверяем, был ли товар уже в корзине
    const existingItemIndex = state.items.findIndex(
      item => item.product_id === productId
    );

    console.log('🔍 Existing item index:', existingItemIndex);
    console.log('📊 Current cart items:', state.items);

    if (existingItemIndex >= 0) {
      dispatch({ type: 'UPDATE_ITEM', payload: newItem });
      console.log('🔄 Item updated in cart');
    } else {
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      console.log('➕ New item added to cart');
    }
    
    console.log('📈 New cart state:', state.items);
    return newItem;
  } catch (error) {
    console.error('❌ Error in addToCart:', error);
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