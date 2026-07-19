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

const buildDiscountPayload = async (reqBody, userId = null) => {
  const {
    shop_id,
    product_id,
    title,
    description,
    discount_kind,
    discount_type,
    discount_value,
    original_price,
    deal_price,
    image_url,
    start_date,
    end_date,
    occasion_type,
    price,
    discount_percentage,
    discounted_price,
  } = reqBody;

  const normalizedDiscountKind = discount_kind || (occasion_type ? 'promotion' : 'deal');
  const normalizedDiscountType = discount_type || 'percentage';
  const normalizedDiscountValue = discount_value ?? discount_percentage ?? null;
  const normalizedOriginalPrice = original_price ?? price ?? null;
  const normalizedDealPrice = deal_price ?? discounted_price ?? null;
  const normalizedDescription = description || (occasion_type ? `${occasion_type} promotion` : null);

  let resolvedShopId = shop_id || null;

  if (!resolvedShopId && product_id) {
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('shop_id')
      .eq('id', product_id)
      .single();

    if (!productError && productData?.shop_id) {
      resolvedShopId = productData.shop_id;
    }
  }

  if (!resolvedShopId && userId) {
    const { data: shopData, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', userId)
      .limit(1)
      .single();

    if (!shopError && shopData?.id) {
      resolvedShopId = shopData.id;
    }
  }

  if (!resolvedShopId) {
    throw new Error('Unable to resolve shop_id from selected product or authenticated user');
  }

  const now = new Date();

  return {
    shop_id: resolvedShopId,
    product_id: product_id || null,
    title: title || '',
    description: normalizedDescription,
    discount_kind: normalizedDiscountKind,
    discount_type: normalizedDiscountType,
    discount_value: normalizedDiscountValue,
    original_price: normalizedOriginalPrice,
    deal_price: normalizedDealPrice,
    image_url: image_url || null,
    start_date,
    end_date,
    occasion_type: occasion_type || null,
    price: price ?? null,
    discount_percentage: discount_percentage ?? null,
    discounted_price: discounted_price ?? null,
    created_at: now,
    updated_at: now,
  };
};

exports.createDiscount = asyncHandler(async (req, res) => {
  try {
    const payload = await buildDiscountPayload(req.body, req.user?.id);

    const { data, error } = await supabase
      .from('discounts')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data,
    });
  } catch (err) {
    // Log the full error server-side (this is what was missing before —
    // the terminal only ever showed "POST /api/v1/deals 500 ..." from morgan,
    // never the actual reason). Postgrest/Supabase errors carry extra detail
    // in .code, .details, and .hint that .message alone doesn't show.
    console.error('[createDiscount] Failed to insert discount:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });

    const statusCode = err.message?.includes('Unable to resolve shop_id') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
    });
  }
});

exports.createDeal = exports.createDiscount;

// Section 3: Get All Deals
// GET /api/v1/deals
// Retrieves all deals with their associated shop information.
// Results are ordered by newest first so users see current promotions.
// Why join with shops: Includes shop name alongside each deal so the client can display "Deal from [Shop Name]" without making a separate API call for shop info.

exports.getDiscounts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('discounts')
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

exports.getDeals = exports.getDiscounts;

// Section 4: Get Deal By ID
// GET /api/v1/deals/:dealId
exports.getDiscount = asyncHandler(async (req, res) => {
  try {
    const discountId = req.params.discountId || req.params.dealId || req.params.id;

    const { data, error } = await supabase
      .from('discounts')
      .select(`
        *,
        shops (
          id,
          name
        )
      `)
      .eq('id', discountId)
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
});

// Section 5: Update Deal
// PATCH /api/v1/deals/:dealId
exports.updateDiscount = asyncHandler(async (req, res) => {
  try {
    const discountId = req.params.discountId || req.params.dealId || req.params.id;
    const updateFields = { ...req.body, updated_at: new Date() };

    const { data, error } = await supabase
      .from('discounts')
      .update(updateFields)
      .eq('id', discountId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 6: Delete Deal
// DELETE /api/v1/deals/:dealId
exports.deleteDiscount = asyncHandler(async (req, res) => {
  try {
    const discountId = req.params.discountId || req.params.dealId || req.params.id;

    const { data, error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', discountId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});