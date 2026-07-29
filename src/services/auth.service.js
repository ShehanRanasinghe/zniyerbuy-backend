// Authentication Service
// Centralizes all authentication-related business logic including Firebase token verification,
// user registration, user lookup, and profile management.
// Why: Separates auth logic from controllers and middleware, making it reusable and testable.

const admin = require('../config/firebase');
const supabase = require('../config/supabase');

/**
 * Verify Firebase ID token
 * @param {string} token - Firebase ID token
 * @returns {Promise<{uid: string, email: string}>} Decoded token
 * @throws {Error} If token is invalid
 */
exports.verifyFirebaseToken = async (token) => {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};

/**
 * Get user by Firebase UID
 * @param {string} firebaseUid - Firebase UID
 * @returns {Promise<{data, error}>}
 */
exports.getUserByFirebaseUid = async (firebaseUid) => {
  return await supabase
    .from('users')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .single();
};

/**
 * Get user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<{data, error}>}
 */
exports.getUserById = async (userId) => {
  return await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<{data, error}>}
 */
exports.getUserByEmail = async (email) => {
  return await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
};

/**
 * Check if user exists by Firebase UID
 * @param {string} firebaseUid - Firebase UID
 * @returns {Promise<boolean>}
 */
exports.userExists = async (firebaseUid) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('firebase_uid', firebaseUid)
    .single();

  return !error && !!data;
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @param {string} userData.firebase_uid - Firebase UID
 * @param {string} userData.email - User email
 * @param {string} userData.full_name - User full name
 * @param {string} [userData.role='customer'] - User role
 * @param {string} [userData.phone] - User phone number
 * @param {string} [userData.avatar_url] - User avatar URL
 * @param {number} [userData.latitude] - User latitude
 * @param {number} [userData.longitude] - User longitude
 * @returns {Promise<{data, error}>}
 */
exports.registerUser = async (userData) => {
  const {
    firebase_uid,
    email,
    full_name,
    role = 'customer',
    phone,
    avatar_url,
    latitude,
    longitude,
  } = userData;

  // Check if user already exists
  const exists = await exports.userExists(firebase_uid);
  if (exists) {
    return {
      data: null,
      error: { message: 'User already exists', code: 'USER_EXISTS' },
    };
  }

  // Create user profile - generate UUID first so we can reuse for shop
  const { v4: uuidv4 } = require('uuid');
  const userId = uuidv4();
  const now = new Date();

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        firebase_uid,
        email,
        full_name,
        role,
        phone,
        avatar_url,
        latitude,
        longitude,
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();

  if (userError) {
    return { data: null, error: userError };
  }

  // Auto-create a shop with the same ID as the user so the frontend can use userData.id as shopId.
  // Note: shop name is deliberately a generic placeholder, NOT full_name —
  // reusing the owner's personal name as the shop name was a bug (the shop
  // name and owner name are different concepts and should never be tied
  // together by default).
  const shopNow = new Date();
  const { error: shopError } = await supabase
    .from('shops')
    .insert([
      {
        id: userId,
        owner_id: userId,
        name: 'My Shop',
        email: email,
        phone: '0000000000',
        address: 'Not set',
        created_at: shopNow,
        updated_at: shopNow,
      },
    ]);

  if (shopError) {
    return { data: null, error: shopError };
  }

  return { data: user, error: null };
};

/**
 * Update user profile
 * @param {string} userId - User UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
exports.updateUserProfile = async (userId, updates) => {
  // Remove fields that shouldn't be updated directly
  const { id, firebase_uid, created_at, ...allowedUpdates } = updates;

  return await supabase
    .from('users')
    .update(allowedUpdates)
    .eq('id', userId)
    .select()
    .single();
};

/**
 * Update user role (admin only)
 * @param {string} userId - User UUID
 * @param {string} role - New role ('customer', 'shop_owner', 'admin')
 * @returns {Promise<{data, error}>}
 */
exports.updateUserRole = async (userId, role) => {
  const validRoles = ['customer', 'shop_owner', 'admin'];
  
  if (!validRoles.includes(role)) {
    return {
      data: null,
      error: { message: 'Invalid role', code: 'INVALID_ROLE' },
    };
  }

  return await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
};

/**
 * Delete user account
 * @param {string} userId - User UUID
 * @returns {Promise<{data, error}>}
 */
exports.deleteUser = async (userId) => {
  return await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .select()
    .single();
};

/**
 * Get all users (admin only)
 * @param {object} options - Query options
 * @param {number} [options.limit] - Limit results
 * @param {number} [options.offset] - Offset for pagination
 * @param {string} [options.role] - Filter by role
 * @param {string} [options.orderBy='created_at'] - Order by field
 * @param {boolean} [options.ascending=false] - Sort order
 * @returns {Promise<{data, error}>}
 */
exports.getAllUsers = async (options = {}) => {
  const {
    limit,
    offset,
    role,
    orderBy = 'created_at',
    ascending = false,
  } = options;

  let query = supabase.from('users').select('*');

  if (role) {
    query = query.eq('role', role);
  }

  query = query.order(orderBy, { ascending });

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  return await query;
};

/**
 * Get recent users (admin only)
 * @param {number} limit - Number of users to return
 * @returns {Promise<{data, error}>}
 */
exports.getRecentUsers = async (limit = 10) => {
  return await supabase
    .from('users')
    .select('id, full_name, email, role, created_at, avatar_url')
    .order('created_at', { ascending: false })
    .limit(limit);
};

/**
 * Count users by role
 * @param {string} [role] - Optional role filter
 * @returns {Promise<number>}
 */
exports.countUsers = async (role = null) => {
  let query = supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (role) {
    query = query.eq('role', role);
  }

  const { count } = await query;
  return count || 0;
};

/**
 * Authenticate user from request token
 * @param {string} authHeader - Authorization header value
 * @returns {Promise<{user, error}>}
 */
exports.authenticateUser = async (authHeader) => {
  try {
    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        user: null,
        error: { message: 'No token provided', code: 'NO_TOKEN' },
      };
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decoded = await exports.verifyFirebaseToken(token);

    // Get user from database
    const { data: user, error } = await exports.getUserByFirebaseUid(decoded.uid);

    if (error || !user) {
      return {
        user: null,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      };
    }

    // Return user with essential fields
    return {
      user: {
        id: user.id,
        firebase_uid: user.firebase_uid,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        nearby_radius_km: user.nearby_radius_km,
        created_at: user.created_at,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: { message: error.message, code: 'AUTH_ERROR' },
    };
  }
};