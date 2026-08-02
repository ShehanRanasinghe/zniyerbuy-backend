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
    // full_name and avatar_url are included since authenticateUser already
    // fetches them — dropping them here meant GET /auth/me (and therefore
    // the profile page) could never reflect the owner's actual name.
    req.user = {
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
      is_active: user.is_active,
      created_at: user.created_at,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: err.message,
    });
  }
};

// Section 3: Optional Auth Middleware
// Same token verification as `protect`, but never rejects the request when
// no/invalid token is present — it just proceeds with req.user left
// undefined. Use on routes that must stay public (guests can use them)
// but still want to know who the caller is when they're logged in.
// Why this was needed: GET /products/search has no auth middleware at all,
// so req.user was always undefined even for logged-in users - the search
// controller's `if (req.user && q?.trim())` check that logs to
// search_history was therefore always false, and no search was EVER
// recorded, for anyone, regardless of login state. That's the actual
// reason search history never showed up on the search page - it's not a
// display bug, nothing was ever being written.
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const { user, error } = await auth.authenticateUser(authHeader);

    if (error || !user) {
      return next();
    }

    req.user = {
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
    };

    next();
  } catch (err) {
    // A bad/expired token on an optional-auth route should degrade to
    // "treat as guest", not fail the request.
    next();
  }
};