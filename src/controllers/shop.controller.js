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
    // const latitude = parseFloat(req.query.latitude);
    // const longitude = parseFloat(req.query.longitude);

    // default radius = 10 km
    const radius = parseFloat(req.query.radius) || 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude query parameters are required.',
      });
    }

    const { data, error } = await supabase
      .from('shops')
      .select(`*, (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))) AS distance`)
      .gte('latitude', latitude - 1)
      .lte('latitude', latitude + 1)
      .gte('longitude', longitude - 1)
      .lte('longitude', longitude + 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter results in JS to enforce exact radius boundary
    const filteredData = data.filter(
      (shop) => shop.distance <= radius
    );

    res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData,
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