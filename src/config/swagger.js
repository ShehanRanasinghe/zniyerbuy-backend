// Swagger/OpenAPI Specification Configuration

// Generates an OpenAPI 3.0 specification from JSDoc annotations found in the route files. 
// This spec powers the interactive Swagger UI served at /api-docs.
// Why: Auto-generates API documentation from inline comments, keeping docs in sync with the actual code and reducing the chance of outdated documentation.

// Section 1: Dependencies
const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path');

// Section 2: OpenAPI Specification Options
// - openapi: targets OpenAPI 3.0.0 standard
// - info: metadata about the API (title, version, description)
// - servers: the base URL(s) where the API is hosted
// - apis: glob pattern telling swagger-jsdoc where to find JSDoc annotations for endpoint definitions
// Why: This configuration is the single source of truth for API metadata and tells swagger-jsdoc which files to scan.
// Note: Using path.join with __dirname ensures the routes path is resolved correctly regardless of where the app is started from.

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ZNIYERBUY API',
      version: '1.0.0',
      description: 'ZNIYERBUY Marketplace API',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/auth.routes.js'),
    path.join(__dirname, '../routes/admin.routes.js'),
    path.join(__dirname, '../routes/shop.routes.js'),
    path.join(__dirname, '../routes/product.routes.js'),
    path.join(__dirname, '../routes/deal.routes.js'),
    path.join(__dirname, '../routes/favorite.routes.js'),
    path.join(__dirname, '../routes/review.routes.js'),
    path.join(__dirname, '../routes/notification.routes.js'),
    path.join(__dirname, '../routes/interaction.routes.js'),
    path.join(__dirname, '../routes/test.routes.js'),
    path.join(__dirname, '../routes/protected.routes.js'),
    path.join(__dirname, '../routes/system.routes.js'),
    path.join(__dirname, '../routes/docs.routes.js'),
    path.join(__dirname, '../routes/health.routes.js'),
    path.join(__dirname, '../routes/upload.routes.js'),
    path.join(__dirname, '../routes/analytics.routes.js'),
    path.join(__dirname, '../routes/ai.routes.js'),
  ],
};

// Section 3: Generate & Export Specification
// swaggerJsDoc parses the options and route files to produce a complete OpenAPI JSON spec object.
module.exports = swaggerJsDoc(options);