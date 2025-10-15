const API_BASE = '/api';

console.log('🔧 API_BASE:', API_BASE);

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export const apiService = {
  // Базовые методы
  get: (url) => {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 GET request to:', fullUrl);
    return fetch(fullUrl).then(handleResponse);
  },
  
  post: (url, data) => {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔧 POST request to:', fullUrl);
    return fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse);
  },
    
  put: (url, data) => {
    const fullUrl = `${API_BASE}${url}`;
    return fetch(fullUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handleResponse);
  },
    
  delete: (url) => {
    const fullUrl = `${API_BASE}${url}`;
    return fetch(fullUrl, {
      method: 'DELETE'
    }).then(handleResponse);
  },
  
  // Products - используйте только эти методы
  getProducts: () => {
    const url = `/products`; // ← ОТНОСИТЕЛЬНЫЙ путь!
    console.log('🔧 getProducts URL:', url);
    return fetch(`${API_BASE}${url}`).then(handleResponse);
  },
  
  getProduct: (id) => fetch(`${API_BASE}/products/${id}`).then(handleResponse),
  
  getProductsByCategory: (categorySlug) => 
    fetch(`${API_BASE}/products/category/${categorySlug}`).then(handleResponse),
    
  searchProducts: (query) => 
    fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`).then(handleResponse),
  
  // Categories - используйте только эти методы
  getCategories: () => {
    const url = `/categories`; // ← ОТНОСИТЕЛЬНЫЙ путь!
    console.log('🔧 getCategories URL:', url);
    return fetch(`${API_BASE}${url}`).then(handleResponse);
  },
  
  getCategory: (slug) => 
    fetch(`${API_BASE}/categories/${slug}`).then(handleResponse),

  // Auth
  login: async (credentials) => {
    try {
      const url = `${API_BASE}/auth/login`;
      console.log('🔧 login URL:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await handleResponse(response);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
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
      
      const data = await handleResponse(response);
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Cart & Orders
  createOrder: (orderData) => {
    const token = localStorage.getItem('authToken');
    return fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    }).then(handleResponse);
  }
};