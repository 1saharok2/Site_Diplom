const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');  
const userRoutes = require('./routes/userRoutes');  

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
 }));
 
app.use(express.json());
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);   
app.use('/api/users', userRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/products', async (req, res) => {
  try {
    // Получаем продукты
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (productsError) throw productsError;

    // Добавляем изображения к каждому продукту
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const { data: images } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', product.id)
          .order('sort_order', { ascending: true });

        return {
          ...product,
          images: images ? images.map(img => img.image_url) : []
        };
      })
    );

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/category/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_slug', req.params.slug);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем продукт
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) throw productError;

    // Получаем изображения продукта
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('image_url, is_main, sort_order')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    // Формируем ответ
    const productWithImages = {
      ...product,
      images: images.map(img => img.image_url) || []
    };

    res.json(productWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));