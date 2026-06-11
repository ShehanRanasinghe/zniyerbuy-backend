// Product Routes

// Defines HTTP routes for all product-related operations including CRUD, search, recommendations, trending, and home feed.
// This is the most complex route file due to the many product endpoints.
// Why route order matters: Express matches routes top-to-bottom.
// Named routes (e.g., /trending, /search) MUST be defined BEFORE parameterized routes (/:id) to prevent Express from interpreting trending as an :id value.

// Section 1: Dependencies & Middleware
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const checkProductOwnership = require('../middleware/checkProductOwnership');

// Section 2: Validator Imports
const {
  createProductValidator,
} = require('../validators/product.validator');

const {
  updateProductImageValidator,
} = require('../validators/upload.validator');

// Section 3: Controller Imports
const {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProductImage,
  getTrendingProducts,
  getRecentlyViewedProducts,
  getRecommendedProducts,
  getInterestBasedRecommendations,
  getSearchSuggestions,
  getHomeFeed,
  getSearchHistory,
  getTrendingSearches,
  getSimilarProducts,
  getRecentlyTrendingProducts,
} = require('../controllers/product.controller');

// Section 4: Personalized Feed Routes (Authenticated)
// These routes require authentication because they return user-specific data based on browsing history and interests.
router.get('/home-feed',protect,getHomeFeed);

router.get('/interest-based',protect,getInterestBasedRecommendations);

router.get('/recommended',protect,getRecommendedProducts);

router.get( '/recently-viewed',protect,getRecentlyViewedProducts);

// Section 5: Public Discovery Routes
// These routes are accessible without authentication to allow unauthenticated users to browse and discover products.
router.get('/trending', getTrendingProducts);

router.get('/recently-trending',getRecentlyTrendingProducts);

router.get('/trending-searches', getTrendingSearches);

// Section 6: Search Routes
// Search history requires auth (to know whose history to return), but general search and suggestions are public.
router.get('/search-history',protect,getSearchHistory);

router.get('/suggestions', getSearchSuggestions);

router.get('/search', searchProducts);

// Section 7: Product Image Update (Protected)
// PATCH /:id/image
// Middleware chain: protect -> authorize -> checkProductOwnership -> updateProductImageValidator -> validate -> updateProductImage
// Why the full middleware chain: Only shop owners or admins who actually own the product should be able to update its image.
router.patch(
  '/:id/image',
  protect,
  authorize('shop_owner', 'admin'),
  checkProductOwnership,
  updateProductImageValidator,
  validate,
  updateProductImage
);

// Section 8: Parameterized & Base Routes
// These MUST come after all named routes to prevent Express from matching trending or search as an :id parameter.
// GET /:id/similar - Public, finds similar products by category
// GET /:id - Public, gets a single product (also tracks views)
// GET / - Public, paginated product listing with filters
// POST / - Authenticated, creates a new product
router.get('/:id/similar',getSimilarProducts);

router.get('/:id', getProductById);

router.get('/', getProducts);

router.post(
  '/',
  protect,
  createProductValidator,
  validate,
  createProduct
);

module.exports = router;