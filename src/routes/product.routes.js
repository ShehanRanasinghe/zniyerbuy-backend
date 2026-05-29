const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const checkProductOwnership = require('../middleware/checkProductOwnership');

const {
  createProductValidator,
} = require('../validators/product.validator');

const {
  updateProductImageValidator,
} = require('../validators/upload.validator');

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
} = require('../controllers/product.controller');

router.get('/home-feed',protect,getHomeFeed);

router.get('/interest-based',protect,getInterestBasedRecommendations);

router.get('/recommended',protect,getRecommendedProducts);

router.get( '/recently-viewed',protect,getRecentlyViewedProducts);

router.get('/trending', getTrendingProducts);

router.get('/trending-searches', getTrendingSearches);

router.get('/search-history',protect,getSearchHistory);

router.get('/suggestions', getSearchSuggestions);

router.get('/search', searchProducts);

router.patch(
  '/:id/image',
  protect,
  authorize('shop_owner', 'admin'),
  checkProductOwnership,
  updateProductImageValidator,
  validate,
  updateProductImage
);

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