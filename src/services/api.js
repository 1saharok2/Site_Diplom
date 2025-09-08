const API_BASE = 'http://localhost:5000/api';

export const apiService = {
  // Products
  getProducts: () => fetch(`${API_BASE}/products`).then(res => res.json()),
  
  getProduct: (id) => fetch(`${API_BASE}/products/${id}`).then(res => res.json()),
  
  // Categories
  getCategories: () => fetch(`${API_BASE}/categories`).then(res => res.json()),
  
  // Auth
  login: (credentials) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }).then(res => res.json()),
  
  register: (userData) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(res => res.json()),

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