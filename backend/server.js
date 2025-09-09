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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
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