// Favorites/Wishlist Routes

// Defines HTTP routes for managing user favorites: listing favorites and adding products to favorites.
// Both endpoints require authentication.
// Why both require auth: Favorites are user-specific. You need to know WHO is adding/viewing favorites, so authentication is mandatory for both operations.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Section 2: Controller & Validator Imports
const {
  addFavoriteValidator,
} = require('../validators/favorite.validator');

const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require('../controllers/favorite.controller');

// Section 3: Route Definitions
// GET / - Get the authenticated user's favorites list
//   Middleware chain: protect -> getFavorites
// POST / - Add a product to favorites
//   Middleware chain: protect -> addFavoriteValidator -> validate -> addFavorite
/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get user's favorite products
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorite products
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Add product to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Product added to favorites
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', protect, getFavorites);

router.post(
  '/',
  protect,
  addFavoriteValidator,
  validate,
  addFavorite
);

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     summary: Remove a product from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Favorite record ID (not the product ID)
 *     responses:
 *       200:
 *         description: Favorite removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the owner of this favorite
 *       404:
 *         description: Favorite not found
 */
router.delete('/:id', protect, removeFavorite);

module.exports = router;