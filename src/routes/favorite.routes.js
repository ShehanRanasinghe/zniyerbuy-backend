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
} = require('../controllers/favorite.controller');

// Section 3: Route Definitions
// GET / - Get the authenticated user's favorites list
//   Middleware chain: protect -> getFavorites
// POST / - Add a product to favorites
//   Middleware chain: protect -> addFavoriteValidator -> validate -> addFavorite
router.get('/', protect, getFavorites);

router.post(
  '/',
  protect,
  addFavoriteValidator,
  validate,
  addFavorite
);

module.exports = router;