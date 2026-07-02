// API Documentation Controller

// Returns a simple JSON listing of all available API endpoint groups.
// This is a lightweight alternative to the full Swagger docs at /api-docs.
// Why: Provides a quick reference for developers to discover available endpoints without loading the full Swagger UI. 
// Useful for CLI-based exploration with tools like curl or httpie.

// Section 1: Get API Docs
// GET /api/v1/docs
// Returns a static JSON object listing all API endpoint groups with their base paths. 
// This serves as a simple API directory.

exports.getApiDocs = (req, res) => {
  res.status(200).json({
    success: true,
    project: 'ZNIYERBUY API',
    version: 'v1',
    swaggerUi: '/docs',
    endpoints: {
      auth: '/api/v1/auth',
      admin: '/api/v1/admin',
      shops: '/api/v1/shops',
      products: '/api/v1/products',
      deals: '/api/v1/deals',
      favorites: '/api/v1/favorites',
      reviews: '/api/v1/reviews',
      notifications: '/api/v1/notifications',
      interactions: '/api/v1/interactions',
      uploads: '/api/v1/uploads',
      analytics: '/api/v1/analytics',
      ai: '/api/v1/ai',
      health: '/api/v1/health',
      system: '/api/v1/system',
      test: '/api/v1/test',
      protected: '/api/v1/protected',
    },
  });
};