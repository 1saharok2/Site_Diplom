// services/productService.js
import { apiService } from './api';
import { ensureValidImageUrl } from '../utils/urlHelpers';

const USE_MOCK_API = true;

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const productService = {
  // Получить все товары
  getProducts: async () => {
    try {
      const products = await apiService.getProducts();
      
      return products.map(product => ({
        ...product,
        image: ensureValidImageUrl(product.image)
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },


  // Получить товар по ID
  getProductById: async (id) => {
    try {
      const product = await apiService.getProduct(id);
      
      return {
        ...product,
        image: isValidUrl(product.image) ? product.image : null
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Создать новый товар
  createProduct: USE_MOCK_API ? mockService.createProduct : async (productData) => {
    try {
      const response = await apiService.post('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при создании товара: ${error.message}`);
    }
  },

  // Обновить товар
  updateProduct: USE_MOCK_API ? mockService.updateProduct : async (id, productData) => {
    try {
      const response = await apiService.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при обновлении товара: ${error.message}`);
    }
  },

  // Удалить товар
  deleteProduct: USE_MOCK_API ? mockService.deleteProduct : async (id) => {
    try {
      const response = await apiService.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при удалении товара: ${error.message}`);
    }
  },

  // Поиск товаров
  searchProducts: async (searchTerm, params = {}) => {
    try {
      const response = await apiService.get('/products/search', {
        params: { q: searchTerm, ...params }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при поиске товаров: ${error.message}`);
    }
  },

  // Получить товары по категории
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await apiService.get(`/categories/${categoryId}/products`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении товаров категории: ${error.message}`);
    }
  },

  // Получить популярные товары
  getPopularProducts: async (limit = 8) => {
    try {
      const response = await apiService.get('/products/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении популярных товаров: ${error.message}`);
    }
  },

  // Получить новые товары
  getNewProducts: async (limit = 8) => {
    try {
      const response = await apiService.get('/products/new', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении новых товаров: ${error.message}`);
    }
  },

  // Получить товары со скидкой
  getDiscountedProducts: async (limit = 8) => {
    try {
      const response = await apiService.get('/products/discounted', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении товаров со скидкой: ${error.message}`);
    }
  },

  // Загрузить изображение товара
  uploadProductImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiService.post('/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при загрузке изображения: ${error.message}`);
    }
  },

  // Обновить количество товара на складе
  updateStock: async (productId, quantity) => {
    try {
      const response = await apiService.patch(`/products/${productId}/stock`, {
        quantity
      });
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при обновлении запасов: ${error.message}`);
    }
  },

  // Получить статистику по товарам
  getProductsStats: async () => {
    try {
      const response = await apiService.get('/products/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Ошибка при получении статистики товаров: ${error.message}`);
    }
  }
};

export default productService;