const supabase = require('../config/supabase');

exports.addFavorite = async (req, res) => {
  try {
    const { product_id } = req.body;

    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: req.user.id,
          product_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};