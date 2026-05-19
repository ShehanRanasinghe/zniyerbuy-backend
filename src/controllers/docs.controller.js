exports.getApiDocs = (req, res) => {
  res.status(200).json({
    success: true,
    project: 'ZNIYERBUY API',
    version: 'v1',
    endpoints: {
      auth: '/api/v1/auth',
      shops: '/api/v1/shops',
      products: '/api/v1/products',
      deals: '/api/v1/deals',
      favorites: '/api/v1/favorites',
      reviews: '/api/v1/reviews',
      notifications: '/api/v1/notifications',
      interactions: '/api/v1/interactions',
    },
  });
};