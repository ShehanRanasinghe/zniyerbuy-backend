// Deals/Promotions Controller

// Handles creating and retrieving promotional deals for shops.
// Deals represent time-limited discounts that shops offer on their products.
// Why: Deals drive customer engagement by highlighting discounted products. 
// They have start/end dates and discount percentages, enabling time-limited promotions within the marketplace.

// Section 1: Dependencies
const supabase = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Create Deal
// POST /api/v1/deals
// Creates a new promotional deal linked to a specific shop.
// Flow:
//   1. Extract deal details from request body
//   2. Insert into the 'deals' table in Supabase
//   3. Return the created deal data
// Why shop_id is required: Each deal belongs to a shop, linking the promotion to the business that created it.

exports.createDeal = asyncHandler(async (req, res) => {
  try {
    const {
      shop_id,
      product_id,
      title,
      description,
      discount_type,
      discount_value,
      original_price,
      deal_price,
      image_url,
      start_date,
      end_date,
    } = req.body;

    const { data, error } = await supabase
      .from('deals')
      .insert([
        {
          shop_id,
          product_id,
          title,
          description,
          discount_type: discount_type || 'percentage',
          discount_value,
          original_price,
          deal_price,
          image_url,
          start_date,
          end_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get All Deals
// GET /api/v1/deals
// Retrieves all deals with their associated shop information.
// Results are ordered by newest first so users see current promotions.
// Why join with shops: Includes shop name alongside each deal so the client can display "Deal from [Shop Name]" without making a separate API call for shop info.

exports.getDeals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        shops (
          id,
          name
        )
      `)
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