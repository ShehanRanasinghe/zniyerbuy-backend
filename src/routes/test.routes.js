const express = require('express');
const router = express.Router();

const supabase = require('../config/supabase');

router.get('/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Supabase connected successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;