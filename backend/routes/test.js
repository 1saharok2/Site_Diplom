const express = require('express');
const { supabase } = require('../config/database');
const router = express.Router();

router.get('/test-connection', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Supabase connection failed',
      error: error.message 
    });
  }
});

module.exports = router;