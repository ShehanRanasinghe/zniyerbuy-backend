const supabase = require('../config/supabase');

exports.createShop = async (req, res) => {
  try {
    const {
      shop_name,
      description,
      address,
      latitude,
      longitude,
      contact_number,
    } = req.body;

    const { data, error } = await supabase
      .from('shops')
      .insert([
        {
          owner_id: req.user.id,
          shop_name,
          description,
          address,
          latitude,
          longitude,
          contact_number,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};