// Authentication Controller

// Handles user registration and current-user retrieval endpoints.
// Works with Firebase (for auth tokens) and Supabase (for user profiles).
// Why: Firebase handles authentication but doesn't store custom user profile data. 
// This controller bridges Firebase auth with our Supabase user profiles, creating user records on registration.

// Section 1: Dependencies
// - supabase: database client for user profile CRUD operations
// - asyncHandler: wraps async functions to catch rejected promises
const supabase = require('../config/supabase');
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

    // Check if a user profile already exists for this Firebase UID
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebase_uid)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Insert the new user profile into Supabase.
    // Default role is 'consumer' if not specified.
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          firebase_uid,
          email,
          full_name,
          role: role || 'consumer',
        },
      ])
      .select()
      .single();

    if (error) throw error;

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