// Role-Based Authorization Middleware

// A higher-order function that returns middleware to restrict route access to specific user roles. 
// Must be used AFTER the auth.protect middleware so that req.user.role is available.
// Why: Different user types (consumer, shop_owner, admin) have different permissions. 
// This middleware enforces role-based access control (RBAC) at the route level.
// Usage: authorize('admin') or authorize('shop_owner', 'admin')

// Section 1: Authorization Factory Function
// Accepts a spread of allowed roles and returns middleware that checks if the current user's role is in the allowed list.
// If not, returns 403 Forbidden. If yes, calls next().
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    next();
  };
};

module.exports = authorize;