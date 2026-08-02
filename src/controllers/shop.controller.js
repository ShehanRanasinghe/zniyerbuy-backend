// Shop Management Controller

// Handles creating shops, finding nearby shops by geolocation, retrieving shop details, and updating shop images.
// Why: Shops are the business entities in the ZNIYERBUY marketplace.
// Each shop is owned by a user with the 'shop_owner' role and contains products and deals.

// Section 1: Dependencies
const { shops } = require('../services');
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
      name,
      description,
      category,
      address,
      city,
      latitude,
      longitude,
      phone,
      email,
      logo_url,
      cover_image_url,
    } = req.body;

    // Use shops service to create shop
    const { data, error } = await shops.createShop({
      owner_id: req.user.id,
      name,
      description,
      category: category || 'other',
      address,
      city,
      latitude,
      longitude,
      phone,
      email,
      logo_url,
      cover_image_url,
    });

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

    // This is the mobile app's public "shops near me" discovery surface —
    // a shop the admin hasn't verified yet (or has deactivated) shouldn't
    // appear here. verifiedOnly/activeOnly default to false in the
    // service (it's shared with internal/admin use), so this is the one
    // place that has to opt in explicitly.
    const { data, error } = await shops.getNearbyShops(latitude, longitude, radius, {
      verifiedOnly: true,
      activeOnly: true,
    });

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

// Section 4: Get Shop By ID
// GET /api/v1/shops/:id
// Retrieves a single shop with its products and active deals.
// This provides all the data needed for a shop detail page.
// Why join products and deals: Avoids separate API calls for shop products and deals. 
// A single request returns everything the client needs to render the shop page.

exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    // Use shops service to get shop with products and deals
    const { data, error } = await shops.getShopWithDetails(id);

    if (error) throw error;

    // A shop the admin hasn't verified yet (or has deactivated) — and
    // everything nested under it (products, deals/promotions) — should
    // not be visible to the public, since this single response is what
    // both the mobile shop-detail page and the "view shop" flow use. The
    // shop's own owner and admins are exempted so the owner can still see
    // and manage their shop before/while it's pending verification.
    const isOwnerOrAdmin = !!req.user && (req.user.id === data?.owner_id || req.user.role === 'admin');
    if (data && (data.is_verified === false || data.is_active === false) && !isOwnerOrAdmin) {
      return res.status(404).json({
        success: false,
        error: 'Shop not found',
      });
    }

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
    const { logo_url, cover_image_url } = req.body;

    // Update either logo or cover image based on what's provided
    const updateData = {};
    if (logo_url) updateData.logo_url = logo_url;
    if (cover_image_url) updateData.cover_image_url = cover_image_url;

    // Use shops service to update shop
    const { data, error } = await shops.updateShop(id, updateData);

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

// Section 6: Update Shop
// PATCH /api/v1/shops/:id
// Updates general shop fields (name, phone, opening_hours, logo_url,
// status, etc). Protected by auth, role authorization, and ownership
// check. Only fields present in the request body are updated (partial
// update) — shops.updateShop() already strips id/owner_id/created_at
// from whatever is passed in.

exports.updateShop = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await shops.updateShop(id, req.body);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data,
    });
  } catch (err) {
    console.error('[updateShop] Failed to update shop:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
    res.status(500).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
  }
});