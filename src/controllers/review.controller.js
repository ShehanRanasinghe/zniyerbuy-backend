const supabase = require('../config/supabase');

exports.createReview = async (req, res) => {
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
};