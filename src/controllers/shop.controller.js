const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

exports.createShop = asyncHandler(async (req, res) => {
  
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
});

exports.getNearbyShops = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
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

exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        products (
          id,
          product_name,
          price,
          image_url
        ),
        deals (
          id,
          title,
          discount_percentage
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};