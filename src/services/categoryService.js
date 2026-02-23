import { apiService } from './api';

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;
  
  // Проверяем абсолютные URL (http/https)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  // Проверяем относительные пути (начинающиеся с /)
  if (url.startsWith('/')) {
    return true;
  }
  
  return false;
};

const processImageUrls = (imageData) => {
  if (!imageData) return [];
  
  if (Array.isArray(imageData)) {
    return imageData.filter(url => url && typeof url === 'string');
  }
  
  if (typeof imageData === 'string') {
    try {
      const parsed = JSON.parse(imageData);
      if (Array.isArray(parsed)) {
        return parsed.filter(url => url && typeof url === 'string');
      } else if (typeof parsed === 'string') {
        return [parsed];
      }
    } catch (e) {
      // Если не JSON, проверяем как обычную строку
      if (imageData.startsWith('http') || imageData.startsWith('/')) {
        return [imageData];
      }
    }
  }
  
  return [];
};

export const categoryService = {
  getAllCategories: async () => {
    try {
      const categories = await apiService.get('/categories');
      console.log('📁 Raw categories from API:', categories);
      
      const processedCategories = categories.map(category => {
        console.log(`🖼️ Category ${category.name} raw image_url:`, category.image_url);
        console.log(`🖼️ Category ${category.name} isValidUrl:`, isValidUrl(category.image_url));
        
        const imageUrl = isValidUrl(category.image_url) ? category.image_url : '/images/placeholder.jpg';
        
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image_url: imageUrl,
          productCount: category.product_count || 0
        };
      });
      
      console.log('✅ Processed categories with images:', processedCategories);
      return processedCategories;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return [];
    }
  },

  getCategoryBySlug: async (slug) => {
    try {
      const category = await apiService.get(`/categories/${slug}`);
      console.log(`📁 Category ${slug} from API:`, category);
      
      const imageUrl = isValidUrl(category.image_url) ? category.image_url : '/images/placeholder.jpg';
      
      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: imageUrl,
        productCount: category.product_count || 0
      };
    } catch (error) {
      console.error(`❌ Error fetching category ${slug}:`, error);
      return null;
    }
  },

  getProductsByCategory: async (categorySlug) => {
    try {
      const products = await apiService.get(`/products/category/${categorySlug}`);
      console.log(`📦 Products for category ${categorySlug}:`, products);
      
      return products.map(product => {
        const processedImages = processImageUrls(product.image_url || product.images);
        
        console.log(`🖼️ Product ${product.name} images:`, processedImages);
        
        return {
          id: product.id,
          name: product.name,
          price: product.price || 0,
          oldPrice: product.old_price || null,
          discount: product.discount || 0,
          rating: product.rating || 0,
          reviewsCount: product.reviews_count || 0,
          inStock: product.stock > 0,
          stock: product.stock || 0,
          isNew: product.is_new || false,
          category: product.category_slug || product.category,
          images: processedImages.length > 0 ? processedImages : 
                 ['/images/placeholder.jpg'],
          description: product.description || '',
          brand: product.brand || '',
          specifications: product.specifications || {},
          slug: product.slug
        };
      });
    } catch (error) {
      console.error(`❌ Error fetching products for category ${categorySlug}:`, error);
      return [];
    }
  },

  getProductById: async (id) => {
    try {
      const product = await apiService.get(`/products/${id}`);
      console.log(`📦 Product ${id} from API:`, product);
      
      const processedImages = processImageUrls(product.image_url || product.images);
      console.log(`🖼️ Processed images for product ${id}:`, processedImages);

      return {
        id: product.id,
        name: product.name || 'Без названия',
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
        image_url: processedImages,
        images: processedImages,
        specifications: product.specifications || {},
        brand: product.brand || '',
        slug: product.slug
      };
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      throw new Error(error.message || 'Ошибка загрузки товара');
    }
  },

  createCategory: async (categoryData) => {
    try {
      const category = await apiService.post('/admin/categories', categoryData);
      return category;
    } catch (error) {
      throw new Error(error.message || 'Ошибка создания категории');
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const category = await apiService.put(`/admin/categories/${id}`, categoryData);
      return category;
    } catch (error) {
      throw new Error(error.message || 'Ошибка обновления категории'); 
    }
  },

  deleteCategory: async (id) => {
    try {
      await apiService.delete(`/admin/categories/${id}`);
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Ошибка удаления категории');
    }
  },

  getProductVariants: async (baseName) => {
    try {
      const variants = await apiService.getProductVariants(baseName);
      console.log(`🔍 Product variants for ${baseName}:`, variants);
      
      return variants.map(product => {
        const processedImages = processImageUrls(product.image_url || product.images);
        
        return {
          id: product.id,
          name: product.name || 'Без названия',
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
          image_url: processedImages,
          images: processedImages,
          specifications: product.specifications || {},
          brand: product.brand || '',
          slug: product.slug
        };
      });
    } catch (error) {
      console.error(`❌ Error fetching variants for ${baseName}:`, error);
      return [];
    }
  },

  getAllProducts: async () => {
    try {
      const products = await apiService.getProducts();
      console.log(`📦 All products:`, products);
      
      return products.map(product => {
        const processedImages = processImageUrls(product.image_url || product.images);
        
        return {
          id: product.id,
          name: product.name || 'Без названия',
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
          image_url: processedImages,
          images: processedImages,
          specifications: product.specifications || {},
          brand: product.brand || '',
          slug: product.slug
        };
      });
    } catch (error) {
      console.error(`❌ Error fetching all products:`, error);
      return [];
    }
  }
};

// Экспорты для обратной совместимости
export const getCategories = categoryService.getAllCategories;
export const getCategoryBySlug = categoryService.getCategoryBySlug;
export const getProductsByCategory = categoryService.getProductsByCategory;
export const getProductById = categoryService.getProductById;

// Дополнительный экспорт для фильтров категории
export const getCategoryFilters = async (categorySlug) => {
  try {
    const data = await apiService.getCategoryFilters(categorySlug);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching filters for category ${categorySlug}:`, error);
    return null;
  }
};