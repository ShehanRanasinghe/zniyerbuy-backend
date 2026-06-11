// Shop Management Controller

// Handles creating shops, finding nearby shops by geolocation, retrieving shop details, and updating shop images.
// Why: Shops are the business entities in the ZNIYERBUY marketplace.
// Each shop is owned by a user with the 'shop_owner' role and contains products and deals.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Create Shop
// POST /api/v1/shops
// Creates a new shop owned by the authenticated user.
// Flow:
//   1. Extract shop details from request body
//   2. Set owner_id to the authenticated user's ID
//   3. Insert into the 'shops' table
//   4. Return the created shop
// Why owner_id comes from req.user.id: Ensures the shop is always linked to the authenticated user, preventing users from creating shops on behalf of others.

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

// Section 3: Get Nearby Shops
// GET /api/v1/shops/nearby?latitude=...&longitude=...&radius=10
// Finds shops within a specified radius (default 10 km) of the given coordinates using the Haversine formula for distance calculation on a sphere (Earth).
// Flow:
//   1. Parse latitude, longitude, and radius from query params
//   2. Validate that latitude and longitude are provided
//   3. Query shops within a rough bounding box (±1 degree)
//   4. Calculate exact distance using Haversine formula in the select
//   5. Filter results in JavaScript to enforce exact radius boundary
// FIX APPLIED: Previously latitude and longitude parsing was commented out, causing 'latitude is not defined' runtime errors.
// Restored the parseFloat calls so the variables are properly defined.
// Why bounding box pre-filter: The ±1 degree filter (gte/lte) acts as a coarse filter to reduce the number of rows before the more expensive Haversine distance calculation. 
// 1 degree ≈ 111 km.

exports.getNearbyShops = async (req, res) => {
  try {
    // Parse coordinates from query parameters
    const latitude = parseFloat(req.query.latitude);
    const longitude = parseFloat(req.query.longitude);

    // Default search radius is 10 km
    const radius = parseFloat(req.query.radius) || 10;

    // Validate that both coordinates are valid numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'latitude and longitude query parameters are required.',
      });
    }

    // Query shops within a rough bounding box and calculate Haversine distance in the SELECT clause
    const { data, error } = await supabase
      .from('shops')
      .select(`*, (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))) AS distance`)
      .gte('latitude', latitude - 1)
      .lte('latitude', latitude + 1)
      .gte('longitude', longitude - 1)
      .lte('longitude', longitude + 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter results in JS to enforce exact radius boundary because the bounding box is only an approximation
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

// Section 4: Get Shop By ID
// GET /api/v1/shops/:id
// Retrieves a single shop with its products and active deals.
// This provides all the data needed for a shop detail page.
// Why join products and deals: Avoids separate API calls for shop products and deals. 
// A single request returns everything the client needs to render the shop page.

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

// Section 5: Update Shop Image
// PATCH /api/v1/shops/:id/image
// Updates the image URL for a specific shop. 
// Protected by auth, role authorization (shop_owner/admin), and ownership check.
// Why PATCH: Only updates the image_url field, not the entire shop record. 
// PATCH is semantically correct for partial updates.

exports.updateShopImage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url } = req.body;

    const { data, error } = await supabase
      .from('shops')
      .update({
        image_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Shop image updated successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});