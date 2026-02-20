import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CartContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getSessionId = () => {
  let sessionId = localStorage.getItem('gul-cart-session');
  if (!sessionId) {
    sessionId = 'cart-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('gul-cart-session', sessionId);
  }
  return sessionId;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], products: [] });
  const [loading, setLoading] = useState(false);
  const sessionId = getSessionId();

  const fetchCart = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/cart/${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      await axios.post(`${API}/cart/${sessionId}/add`, {
        product_id: productId,
        quantity
      });
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      await axios.post(`${API}/cart/${sessionId}/update`, {
        product_id: productId,
        quantity
      });
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      await axios.delete(`${API}/cart/${sessionId}/item/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API}/cart/${sessionId}`);
      setCart({ items: [], products: [] });
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cart.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cart.products.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      sessionId,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      getTotal,
      getItemCount
    }}>
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
