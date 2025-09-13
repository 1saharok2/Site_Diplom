import { supabase } from './supabaseClient';

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
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: isValidUrl(category.image_url) ? category.image_url : null,
        productCount: category.product_count || 0  // ← ИСПРАВИЛ НА productCount
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Получить категорию по slug
  getCategoryBySlug: async (slug) => {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: isValidUrl(category.image_url) ? category.image_url : null,
        productCount: category.product_count || 0  // ← ИСПРАВИЛ НА productCount
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Получить товары по категории
  getProductsByCategory: async (categorySlug) => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_slug', categorySlug)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return products.map(product => ({
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
        category: product.category_slug,
        images: product.image_url ? [product.image_url] : [],
        description: product.description || '',
        brand: product.brand || '',
        specifications: product.specifications || {},
        slug: product.slug
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error(error.message || 'Ошибка загрузки товаров категории');
    }
  },

  // Получить товар по ID
  getProductById: async (id) => {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

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
        category: product.category_slug,
        categoryName: product.category_slug,
        images: product.image_url ? [product.image_url] : 
               ['https://via.placeholder.com/600x600/8767c2/ffffff?text=Нет+изображения'],
        specifications: product.specifications || {},
        brand: product.brand || '',
        slug: product.slug
      };
    } catch (error) {
      console.error('Ошибка загрузки товара:', error);
      throw new Error(error.message || 'Ошибка загрузки товара');
    }
  },

  // Создать новую категорию
  createCategory: async (categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          image_url: categoryData.image,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Ошибка создания категории');
    }
  },

  // Обновить категорию
  updateCategory: async (id, categoryData) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          image_url: categoryData.image,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Ошибка обновления категории');
    }
  },

  // Удалить категорию
  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Ошибка удаления категории');
    }
  }
};

// Экспорты для обратной совместимости
export const getCategories = categoryService.getAllCategories;
export const getCategoryBySlug = categoryService.getCategoryBySlug;
export const getProductsByCategory = categoryService.getProductsByCategory;
export const getProductById = categoryService.getProductById;