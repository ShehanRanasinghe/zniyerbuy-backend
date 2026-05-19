const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

exports.createReview = asyncHandler(async (req, res) => {
  try {
    const {
      shop_id,
      rating,
      comment,
    } = req.body;

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: req.user.id,
          shop_id,
          rating,
          comment,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          id,
          full_name
        )
      `)
      .eq('shop_id', shopId)
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