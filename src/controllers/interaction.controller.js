const supabase = require('../config/supabase');

exports.trackInteraction = async (req, res) => {
  try {
    const {
      product_id,
      interaction_type,
    } = req.body;

    const { data, error } = await supabase
      .from('user_interactions')
      .insert([
        {
          user_id: req.user.id,
          product_id,
          interaction_type,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Interaction tracked successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};