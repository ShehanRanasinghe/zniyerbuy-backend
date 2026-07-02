// Protected Test Route

// A simple protected route used to verify that authentication middleware is working correctly. Returns the authenticated user's data.
// Why: Useful during development and testing to confirm that the auth middleware (token verification, user lookup) is functioning properly without testing a complex endpoint.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

// Section 2: Route Definition
// GET /profile - Returns the authenticated user's data
//   Middleware chain: protect -> inline handler
//   Why inline handler: This is a test/debug route, so a separate controller isn't necessary for this simple response.
/**
 * @swagger
 * /protected/profile:
 *   get:
 *     summary: Test protected route - returns authenticated user data
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protected route accessed successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected route accessed',
    user: req.user,
  });
});

module.exports = router;