// Validation Service
// Provides business logic validation functions beyond basic input validation.
// Why: Separates business rules from controllers for better testability and reusability.

const supabase = require('../config/supabase');

/**
 * Check if a user owns a shop
 * @param {string} userId - User ID
 * @param {string} shopId - Shop ID
 * @returns {Promise<boolean>}
 */
exports.isShopOwner = async (userId, shopId) => {
  const { data, error } = await supabase
    .from('shops')
    .select('owner_id')
    .eq('id', shopId)
    .single();

  if (error || !data) return false;
  return data.owner_id === userId;
};

/**
 * Check if a user owns a product (via shop ownership)
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>}
 */
exports.isProductOwner = async (userId, productId) => {
  const { data, error } = await supabase
    .from('products')
    .select('shop_id, shops!shop_id(owner_id)')
    .eq('id', productId)
    .single();

  if (error || !data) return false;
  return data.shops?.owner_id === userId;
};

/**
 * Check if a deal is still active
 * @param {string} dealId - Deal ID
 * @returns {Promise<boolean>}
 */
exports.isDealActive = async (dealId) => {
  const { data, error } = await supabase
    .from('discounts')
    .select('is_active, start_date, end_date')
    .eq('id', dealId)
    .single();

  if (error || !data) return false;

  const now = new Date();
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);

  return data.is_active && now >= startDate && now <= endDate;
};

/**
 * Check if a product is available
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>}
 */
exports.isProductAvailable = async (productId) => {
  const { data, error } = await supabase
    .from('products')
    .select('is_available, stock_quantity')
    .eq('id', productId)
    .single();

  if (error || !data) return false;
  return data.is_available && data.stock_quantity > 0;
};

/**
 * Validate shop category
 * @param {string} category - Category name
 * @returns {boolean}
 */
exports.isValidShopCategory = (category) => {
  const validCategories = [
    'grocery',
    'electronics',
    'clothing',
    'food',
    'pharmacy',
    'beauty',
    'sports',
    'other',
  ];
  return validCategories.includes(category);
};

/**
 * Validate product unit
 * @param {string} unit - Unit type
 * @returns {boolean}
 */
exports.isValidProductUnit = (unit) => {
  const validUnits = [
    'pcs', 'piece', 'pair', 'set', 'pack', 'box', 'carton', 'bundle', 'dozen',
    'roll', 'sheet', 'bottle', 'can', 'jar', 'tin', 'bag', 'sack', 'pouch',
    'packet', 'tube', 'tablet', 'capsule', 'egg', 'tray', 'bunch', 'loaf',
    'mg', 'g', 'kg', 't', 'mL', 'L', 'm³', 'mm', 'cm', 'm', 'km', 'in', 'ft', 'yd',
    'cm²', 'm²', 'ft²', 'yd²', 'drum', 'barrel', 'coil', 'kit', 'litre', 'metre'
  ];

  return validUnits.includes(unit);
};

/**
 * Validate notification type
 * @param {string} type - Notification type
 * @returns {boolean}
 */
exports.isValidNotificationType = (type) => {
  const validTypes = ['deal', 'system', 'promo', 'alert'];
  return validTypes.includes(type);
};

/**
 * Validate user action type
 * @param {string} actionType - Action type
 * @returns {boolean}
 */
exports.isValidActionType = (actionType) => {
  const validActions = ['view', 'save', 'click_deal', 'search', 'purchase'];
  return validActions.includes(actionType);
};

/**
 * Check if user has already favorited a product
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @returns {Promise<boolean>}
 */
exports.hasFavorited = async (userId, productId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  return !error && !!data;
};

/**
 * Validate deal dates
 * @param {string} startDate - Start date (ISO 8601)
 * @param {string} endDate - End date (ISO 8601)
 * @returns {object} - {valid: boolean, error: string}
 */
exports.validateDealDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date' };
  }

  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }

  if (end <= now) {
    return { valid: false, error: 'End date must be in the future' };
  }

  return { valid: true };
};