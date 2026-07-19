// Authentication Controller

// Handles user registration and current-user retrieval endpoints.
// Works with Firebase (for auth tokens) and Supabase (for user profiles).
// Why: Firebase handles authentication but doesn't store custom user profile data. 
// This controller bridges Firebase auth with our Supabase user profiles, creating user records on registration.

// Section 1: Dependencies
// - auth: Authentication service for user management
// - asyncHandler: wraps async functions to catch rejected promises
const { auth } = require('../services');
const asyncHandler = require('../utils/asyncHandler');

// Section 2: Register User
// POST /api/v1/auth/register
// Creates a new user profile in Supabase linked to their Firebase UID.
// Flow:
//   1. Extract user data from request body
//   2. Check if a user with the same firebase_uid already exists
//   3. If exists, return 400 to prevent duplicate registrations
//   4. Insert new user record with default role 'consumer'
//   5. Return the created user data
// Why check for existing user first: Prevents duplicate profiles when the client retries registration (e.g., due to network issues).

exports.registerUser = asyncHandler(async (req, res) => {
  try {
    const {
      firebase_uid,
      email,
      full_name,
      role,
    } = req.body;

    // Use auth service to register user
    const { data, error } = await auth.registerUser({
      firebase_uid,
      email,
      full_name,
      role: role || 'consumer',
    });

    if (error) {
      const errorMessage = typeof error === 'string'
        ? error
        : error?.message || JSON.stringify(error);

      // Check if error is due to existing user
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }
      throw new Error(errorMessage);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Section 3: Get Current User
// GET /api/v1/auth/me
// Returns the currently authenticated user's information that was attached to req.user by the auth.protect middleware.
// Why this is so simple: The protect middleware already did all the heavy lifting (token verification, user lookup). 
// This just sends back what protect found.

exports.getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Section 4: Update Current User's Profile
// PATCH /api/v1/auth/me
// Updates the authenticated user's own profile fields (e.g. full_name,
// phone, avatar_url). This is separate from shop updates — the owner's
// name (users.full_name) and the shop's name (shops.name) are different
// fields and must be updated independently.

exports.updateProfile = asyncHandler(async (req, res) => {
  try {
    const { data, error } = await auth.updateUserProfile(req.user.id, req.body);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data,
    });
  } catch (err) {
    console.error('[updateProfile] Failed to update profile:', {
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