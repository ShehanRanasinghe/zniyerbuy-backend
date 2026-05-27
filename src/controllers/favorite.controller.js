const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

exports.addFavorite = asyncHandler(async (req, res) => {
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

    await supabase.rpc('increment_product_favorites', {product_id,});

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
});

exports.getFavorites = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          id,
          product_name,
          price,
          image_url
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};