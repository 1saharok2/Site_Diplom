// src/services/categoryService.js
import { apiService } from './api';
const API_BASE = 'http://localhost:5000/api';

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const categoryService = {
  // Получить все категории
  getAllCategories: async () => {
    try {
      const categories = await apiService.getCategories();
      
      return categories.map(category => ({
        ...category,
        image: isValidUrl(category.image) ? category.image : null
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Получить категорию по slug
  getCategoryBySlug: async (slug) => {
    try {
      const category = await apiService.getCategory(slug);
      
      return {
        ...category,
        image: isValidUrl(category.image) ? category.image : null
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },


  // Получить товары по категории
  getProductsByCategory: async (categorySlug) => {
    try {
      return await apiService.getProductsByCategory(categorySlug);
    } catch (error) {
      throw new Error(error.message || 'Ошибка загрузки товаров категории');
    }
  },

  // Получить товар по ID
getProductById: async (id) => {
    try {
      const product = await apiService.getProduct(id);
      
      // Нормализуем данные для фронтенда
      return {
        id: product.id || product._id,
        name: product.name || 'Без названия',
        description: product.description || product.shortDescription || 'Описание отсутствует',
        price: product.price || 0,
        oldPrice: product.oldPrice || product.originalPrice || product.price || 0,
        discount: product.discount || product.discountPercentage || 0,
        rating: product.rating || product.averageRating || 0,
        reviewsCount: product.reviewsCount || product.reviewCount || 0,
        inStock: product.inStock !== undefined ? product.inStock : product.stock > 0,
        stock: product.stock || 0,
        isNew: product.isNew || product.new || false,
        category: product.category || product.categoryId || 'uncategorized',
        categoryName: product.categoryName || product.category?.name || 'Без категории',
        images: Array.isArray(product.images) ? product.images : 
               product.image ? [product.image] : 
               ['https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения'],
        specifications: product.specifications || product.features || {},
        brand: product.brand || '',
        sku: product.sku || product.productCode || '',
        weight: product.weight || 0,
        dimensions: product.dimensions || {}
      };
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
      throw new Error(error.message || 'Ошибка загрузки товара');
    }
  },

  // Создать новую категорию
  createCategory: async (categoryData) => {
    try {
      return await apiService.post('/categories', categoryData);
    } catch (error) {
      throw new Error(error.message || 'Ошибка создания категории');
    }
  },

  // Обновить категорию
  updateCategory: async (id, categoryData) => {
    try {
      return await apiService.put(`/categories/${id}`, categoryData);
    } catch (error) {
      throw new Error(error.message || 'Ошибка обновления категории');
    }
  },

  // Удалить категорию
  deleteCategory: async (id) => {
    try {
      return await apiService.delete(`/categories/${id}`);
    } catch (error) {
      throw new Error(error.message || 'Ошибка удаления категории');
    }
  }
};

export const getCategories = categoryService.getAllCategories;
export const getCategoryBySlug = categoryService.getCategoryBySlug;
export const getProductsByCategory = categoryService.getProductsByCategory;
export const getProductById = categoryService.getProductById;