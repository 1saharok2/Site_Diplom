const supabase = require('../config/supabase');

const saveProductImages = async (productId, images) => {
  try {
    if (!Array.isArray(images) || images.length === 0) {
      return [];
    }

    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    const imageRecords = images.map((imageUrl, index) => ({
      product_id: productId,
      image_url: imageUrl,
      is_main: index === 0, // первое изображение - основное
      sort_order: index
    }));

    const { data, error } = await supabase
      .from('product_images')
      .insert(imageRecords)
      .select('*');

    if (error) throw error;
    return data;

  } catch (error) {
    console.error('Error saving product images:', error);
    throw error;
  }
};

const getProductImages = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];

  } catch (error) {
    console.error('Error getting product images:', error);
    return [];
  }
};

const deleteProductImages = async (productId) => {
  try {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;
    
  } catch (error) {
    console.error('Error deleting product images:', error);
    throw error;
  }
};

module.exports = {
  saveProductImages,
  getProductImages,
  deleteProductImages
};