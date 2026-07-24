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
  updateProduct,
  deleteProduct,
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
  getNearbyProducts,
} = require('../controllers/product.controller');

// Section 4: Personalized Feed Routes (Authenticated)
// These routes require authentication because they return user-specific data based on browsing history and interests.
/**
 * @swagger
 * /products/home-feed:
 *   get:
 *     summary: Get personalized home feed
 *     tags: [Products - Personalized]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personalized product feed
 *       401:
 *         description: Unauthorized
 */
router.get('/home-feed',protect,getHomeFeed);

/**
 * @swagger
 * /products/interest-based:
 *   get:
 *     summary: Get interest-based recommendations
 *     tags: [Products - Personalized]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Interest-based product recommendations
 *       401:
 *         description: Unauthorized
 */
router.get('/interest-based',protect,getInterestBasedRecommendations);

/**
 * @swagger
 * /products/recommended:
 *   get:
 *     summary: Get recommended products
 *     tags: [Products - Personalized]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended products
 *       401:
 *         description: Unauthorized
 */
router.get('/recommended',protect,getRecommendedProducts);

/**
 * @swagger
 * /products/recently-viewed:
 *   get:
 *     summary: Get recently viewed products
 *     tags: [Products - Personalized]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed products
 *       401:
 *         description: Unauthorized
 */
router.get( '/recently-viewed',protect,getRecentlyViewedProducts);

// Section 5: Public Discovery Routes
// These routes are accessible without authentication to allow unauthenticated users to browse and discover products.

/**
 * @swagger
 * /products/trending:
 *   get:
 *     summary: Get trending products
 *     tags: [Products - Discovery]
 *     responses:
 *       200:
 *         description: List of trending products
 */
router.get('/trending', getTrendingProducts);

/**
 * @swagger
 * /products/nearby:
 *   get:
 *     summary: Get products near the customer's location, nearest and cheapest first
 *     tags: [Products - Discovery]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Nearby products, sorted nearest then cheapest
 *       400:
 *         description: Missing latitude/longitude
 */
router.get('/nearby', getNearbyProducts);

/**
 * @swagger
 * /products/recently-trending:
 *   get:
 *     summary: Get recently trending products
 *     tags: [Products - Discovery]
 *     responses:
 *       200:
 *         description: Recently trending products
 */
router.get('/recently-trending',getRecentlyTrendingProducts);

/**
 * @swagger
 * /products/trending-searches:
 *   get:
 *     summary: Get trending search terms
 *     tags: [Products - Discovery]
 *     responses:
 *       200:
 *         description: List of trending searches
 */
router.get('/trending-searches', getTrendingSearches);

// Section 6: Search Routes
// Search history requires auth (to know whose history to return), but general search and suggestions are public.
/**
 * @swagger
 * /products/search-history:
 *   get:
 *     summary: Get user's search history
 *     tags: [Products - Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User search history
 *       401:
 *         description: Unauthorized
 */
router.get('/search-history',protect,getSearchHistory);

/**
 * @swagger
 * /products/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Products - Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search suggestions
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products - Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchProducts);

// Section 7: Product Image Update (Protected)
// PATCH /:id/image
// Middleware chain: protect -> authorize -> checkProductOwnership -> updateProductImageValidator -> validate -> updateProductImage
// Why the full middleware chain: Only shop owners or admins who actually own the product should be able to update its image.

/**
 * @swagger
 * /products/{id}/image:
 *   patch:
 *     summary: Update product image
 *     tags: [Products - Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - image_url
 *             properties:
 *               image_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Product image updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not product owner
 */
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
/**
 * @swagger
 * /products/{id}/similar:
 *   get:
 *     summary: Get similar products
 *     tags: [Products - Discovery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Similar products
 *       404:
 *         description: Product not found
 */
router.get('/:id/similar',getSimilarProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProductById);

router.patch(
  '/:id',
  protect,
  authorize('shop_owner', 'admin'),
  checkProductOwnership,
  updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products - Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not product owner
 *       404:
 *         description: Product not found
 */
router.delete(
  '/:id',
  protect,
  authorize('shop_owner', 'admin'),
  checkProductOwnership,
  deleteProduct
);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: shop_id
 *         schema:
 *           type: string
 *         description: Filter by shop
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     tags: [Products - Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - shop_id
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               shop_id:
 *                 type: string
 *               image_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/', getProducts);

router.post(
  '/',
  protect,
  createProductValidator,
  validate,
  createProduct
);

module.exports = router;