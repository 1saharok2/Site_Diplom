const API_BASE = 'http://localhost:5000/api';

export const apiService = {
  get: (url) => fetch(`${API_BASE}${url}`).then(res => res.json()),
  post: (url, data) => 
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  put: (url, data) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  delete: (url) =>
    fetch(`${API_BASE}${url}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  
  // Products
  getProducts: () => fetch(`${API_BASE}/products`).then(res => res.json()),
  getProduct: (id) => fetch(`${API_BASE}/products/${id}`).then(res => res.json()),
  getProductsByCategory: (categorySlug) => 
    fetch(`${API_BASE}/products/category/${categorySlug}`).then(res => res.json()),
  searchProducts: (query) => 
    fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
  
  // Categories
  getCategories: () => fetch(`${API_BASE}/categories`).then(res => res.json()),
  getCategory: (slug) => 
    fetch(`${API_BASE}/categories/${slug}`).then(res => res.json()),

  // Auth
 login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error('Ошибка регистрации');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Cart & Orders
  createOrder: (orderData, token) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    }).then(res => res.json())
};