// Authentication Routes

// Defines HTTP routes for user authentication operations: registration and current-user retrieval.
// Why separate route file: Keeps route definitions modular and focused on a single domain. 
// Each route file wires together middleware (auth, validation) and controller functions for its resource.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Section 2: Controller & Validator Imports
const {
  registerUser,
  getCurrentUser,
} = require('../controllers/auth.controller');

const {
  registerValidator,
} = require('../validators/auth.validator');

// Section 3: Route Definitions
// POST /register - Register a new user
//   Middleware chain: registerValidator -> validate -> registerUser
//   Why: Validates input fields, checks for errors, then creates the user.
// GET /me - Get currently authenticated user's info
//   Middleware chain: protect -> getCurrentUser
//   Why: protect verifies the token and attaches req.user, then getCurrentUser returns that user data.

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', registerValidator, validate, registerUser);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getCurrentUser);

module.exports = router;