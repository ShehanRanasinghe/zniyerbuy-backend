// Service Layer Index
// Exports all services for easy importing across the application.
// Usage: const { auth, shops, products } = require('../services');

module.exports = {
  // Core business logic services
  auth: require('./auth.service'),
  shops: require('./shops.service'),
  products: require('./products.service'),
  
  // Utility services
  database: require('./database.service'),
  recommendation: require('./recommendation.service'),
  validation: require('./validation.service'),
};
