import { apiService } from './api';

export const productService = {
  // Получить все товары
  getProducts: async () => {
    try {
      const products = await apiService.get('/products');
      console.log('📦 Raw products from API:', products);
      
      return products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price || 0,
        oldPrice: product.old_price || null,
        discount: product.discount || 0,
        rating: product.rating || 0,
        reviewsCount: product.reviews_count || 0,
        inStock: product.stock > 0,
        stock: product.stock || 0,
        isNew: product.is_new || false,
        category: product.category_slug || product.category,
        description: product.description || '',
        brand: product.brand || '',
        specifications: product.specifications || {},
        // Просто берём images как есть, если это массив
        images: Array.isArray(product.images) ? product.images : 
               (product.image_url ? [product.image_url] : [])
      }));
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return [];
    }
  },

  // Получить товар по ID
  getProductById: async (id) => {
    try {
      const product = await apiService.get(`/products/${id}`);
      console.log(`📦 Product ${id} from API:`, product);
      
      // Простое извлечение изображений
      let images = [];
      if (Array.isArray(product.images)) {
        images = product.images;
        console.log(`✅ Используем массив images:`, images);
      } else if (product.image_url) {
        images = [product.image_url];
        console.log(`✅ Используем одиночное image_url:`, images);
      }

      return {
        id: product.id,
        name: product.name || 'Без названия',
        slug: product.slug,
        description: product.description || 'Описание отсутствует',
        price: product.price || 0,
        oldPrice: product.old_price || product.price || 0,
        discount: product.discount || 0,
        rating: product.rating || 0,
        reviewsCount: product.reviews_count || 0,
        inStock: product.stock > 0,
        stock: product.stock || 0,
        isNew: product.is_new || false,
        category: product.category_slug || product.category,
        categoryName: product.category_slug || product.category,
        images: images,  // Только images, без дублирования
        specifications: product.specifications || {},
        brand: product.brand || ''
      };
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      throw new Error(error.message || 'Ошибка загрузки товара');
    }
  },

  // Получить товар по slug
  getProductBySlug: async (slug) => {
    try {
      const product = await apiService.get(`/products/slug/${slug}`);
      console.log(`📦 Product ${slug} from API:`, product);
      
      let images = [];
      if (Array.isArray(product.images)) {
        images = product.images;
      } else if (product.image_url) {
        images = [product.image_url];
      }

      return {
        id: product.id,
        name: product.name || 'Без названия',
        slug: product.slug,
        description: product.description || 'Описание отсутствует',
        price: product.price || 0,
        oldPrice: product.old_price || product.price || 0,
        discount: product.discount || 0,
        rating: product.rating || 0,
        reviewsCount: product.reviews_count || 0,
        inStock: product.stock > 0,
        stock: product.stock || 0,
        isNew: product.is_new || false,
        category: product.category_slug || product.category,
        categoryName: product.category_slug || product.category,
        images: images,
        specifications: product.specifications || {},
        brand: product.brand || ''
      };
    } catch (error) {
      console.error(`❌ Error fetching product ${slug}:`, error);
      throw new Error(error.message || 'Ошибка загрузки товара');
    }
  },

  // Получить товары по категории
  getProductsByCategory: async (categorySlug) => {
    try {
      const products = await apiService.get(`/products/category/${categorySlug}`);
      console.log(`📦 Products for category ${categorySlug}:`, products);
      
      return products.map(product => {
        let images = [];
        if (Array.isArray(product.images)) {
          images = product.images;
        } else if (product.image_url) {
          images = [product.image_url];
        }
        
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price || 0,
          oldPrice: product.old_price || null,
          discount: product.discount || 0,
          rating: product.rating || 0,
          reviewsCount: product.reviews_count || 0,
          inStock: product.stock > 0,
          stock: product.stock || 0,
          isNew: product.is_new || false,
          category: product.category_slug || product.category,
          images: images.length > 0 ? images : ['/images/placeholder.jpg'],
          description: product.description || '',
          brand: product.brand || '',
          specifications: product.specifications || {}
        };
      });
    } catch (error) {
      console.error(`❌ Error fetching products for category ${categorySlug}:`, error);
      return [];
    }
  },

  // Создать новый товар
  createProduct: async (productData) => {
    try {
      const product = await apiService.post('/admin/products', productData);
      return product;
    } catch (error) {
      throw new Error(error.message || 'Ошибка создания товара');
    }
  },

  // Обновить товар
  updateProduct: async (id, productData) => {
    try {
      const product = await apiService.put(`/admin/products/${id}`, productData);
      return product;
    } catch (error) {
      throw new Error(error.message || 'Ошибка обновления товара');
    }
  },

  // Удалить товар
  deleteProduct: async (id) => {
    try {
      await apiService.delete(`/admin/products/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Ошибка удаления товара');
    }
  },

  // Поиск товаров
  searchProducts: async (searchTerm, params = {}) => {
    try {
      const products = await apiService.get('/products/search', {
        params: { q: searchTerm, ...params }
      });
      return products;
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return [];
    }
  },

  // Получить популярные товары
  getPopularProducts: async (limit = 8) => {
    try {
      const products = await apiService.get('/products/popular', {
        params: { limit }
      });
      return products;
    } catch (error) {
      console.error('❌ Error fetching popular products:', error);
      return [];
    }
  },

  // Получить новые товары
  getNewProducts: async (limit = 8) => {
    try {
      const products = await apiService.get('/products/new', {
        params: { limit }
      });
      return products;
    } catch (error) {
      console.error('❌ Error fetching new products:', error);
      return [];
    }
  },

  // Получить товары со скидкой
  getDiscountedProducts: async (limit = 8) => {
    try {
      const products = await apiService.get('/products/discounted', {
        params: { limit }
      });
      return products;
    } catch (error) {
      console.error('❌ Error fetching discounted products:', error);
      return [];
    }
  }
};

// Экспорты для обратной совместимости
export const getProducts = productService.getProducts;
export const getProductById = productService.getProductById;
export const getProductBySlug = productService.getProductBySlug;
export const getProductsByCategory = productService.getProductsByCategory;