// Swagger/OpenAPI Specification Configuration

// Generates an OpenAPI 3.0 specification from JSDoc annotations found in the route files. 
// This spec powers the interactive Swagger UI served at /api-docs.
// Why: Auto-generates API documentation from inline comments, keeping docs in sync with the actual code and reducing the chance of outdated documentation.

// Section 1: Swagger JSDoc Import
const swaggerJsDoc = require('swagger-jsdoc');

// Section 2: OpenAPI Specification Options
// - openapi: targets OpenAPI 3.0.0 standard
// - info: metadata about the API (title, version, description)
// - servers: the base URL(s) where the API is hosted
// - apis: glob pattern telling swagger-jsdoc where to find JSDoc annotations for endpoint definitions
// Why: This configuration is the single source of truth for API metadata and tells swagger-jsdoc which files to scan.

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
        url: 'http://localhost:5000/api/v1',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

// Section 3: Generate & Export Specification
// swaggerJsDoc parses the options and route files to produce a complete OpenAPI JSON spec object.
module.exports = swaggerJsDoc(options);