// Authentication Middleware

// Verifies Firebase ID tokens from the Authorization header and attaches the authenticated user's information to req.user.
// This middleware is used on all protected routes.
// Why: Ensures only authenticated users can access protected endpoints.
// Firebase handles the actual login (email/password, Google, etc.), and this middleware validates the resulting JWT token server-side.

// Section 1: Dependencies
// - auth: Authentication service for user verification
const { auth } = require('../services');

// Section 2: Protect Middleware
// Extracts the Bearer token from the Authorization header, verifies it with Firebase, then fetches the corresponding user record from Supabase to confirm the user exists in our DB.
// Flow:
//   1. Check for Authorization header with "Bearer " prefix
//   2. Extract and verify the Firebase ID token
//   3. Look up the user in Supabase by firebase_uid
//   4. Attach user info (id, email, role) to req.user
//   5. Call next() to proceed to the route handler
// Why req.user stores decoded.uid instead of user.id: The firebase_uid is used as the primary user identifier across the system to maintain consistency with Firebase auth.

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Reject requests without a valid Bearer token format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    // Use auth service to verify token and get user
    const { user, error } = await auth.authenticateUser(authHeader);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: error || 'User not found',
      });
    }

    // Attach user info to the request for downstream route handlers.
    req.user = {
      id: user.id,
      firebase_uid: user.firebase_uid,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};