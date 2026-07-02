// Express Application Entry Point

// This file initializes and configures the Express server for the ZNIYERBUY marketplace API. 
// It sets up all global middleware (security, parsing, logging), registers API route handlers, and configures error handling.
// Why: Centralizes all Express configuration in one place so the server.js (or index.js) only needs to call app.listen(). 
// This separation makes the app testable without starting a real HTTP server.

// Section 1: Core Dependencies
// - Express framework for HTTP server
// - cors for Cross-Origin Resource Sharing
// - helmet for HTTP security headers
// - morgan for HTTP request logging
// - compression for gzip response compression
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Section 2: Internal Middleware Imports
// - notFound: catches requests to undefined routes (404)
// - errorHandler: global error handler for all unhandled errors
// - requestTime: attaches ISO timestamp to each request object
// - apiLimiter: rate limiter to prevent API abuse
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const requestTime = require('./middleware/requestTime');
const apiLimiter = require('./middleware/rateLimiter');

// Section 3: Swagger API Documentation Setup
// - swaggerUi serves the interactive API docs UI
// - swaggerSpec holds the auto-generated OpenAPI spec
// Why: Provides a self-documenting API interface at /api-docs so developers can explore and test endpoints visually.
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Section 4: Route Imports
// - systemRoutes is imported separately because it's mounted before the general /api/v1 routes.
const systemRoutes = require('./routes/system.routes');

// Section 5: Express App Initialization
const app = express();

// Section 6: Global Middleware Registration
// Order matters here:
//   1. helmet() - sets security headers first to protect all responses
//   2. compression() - compresses responses to reduce bandwidth
//   3. cors() - enables cross-origin requests from the frontend
//   4. morgan('dev') - logs HTTP requests for debugging
//   5. requestTime - stamps each request with arrival time
//   6. express.json() - parses JSON request bodies (10mb limit for image uploads)
//   7. apiLimiter - rate limits all /api routes to prevent abuse
// Why this order: Security headers and compression should wrap everything, CORS must be set before routes handle requests, and rate limiting should be applied before route handlers execute.
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('dev'));
app.use(requestTime);
app.use(express.json({ limit: '10mb' }));

// Apply rate limiting to all /api routes BEFORE route handlers.
// Why: Placed here so every /api request counts toward the limit.
// Previously this was placed AFTER all routes, which made it ineffective.
app.use('/api', apiLimiter);

// Section 7: Swagger Documentation Route
// Mounts the Swagger UI at /docs for interactive API exploration.
// Why: Developers and testers can see all endpoints, request/response schemas, and try out API calls without external tools like Postman.
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Section 8: System & Health Check Routes
// These are lightweight endpoints used by monitoring tools and load balancers to verify the API is alive and responding.
// Why: Allows uptime monitoring services (e.g., AWS ALB, UptimeRobot) to confirm the server is healthy without hitting business logic.
app.use('/api/v1/system', systemRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ZNIYERBUY API is running',
  });
});

app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    project: 'ZNIYERBUY API',
    version: 'v1',
    status: 'running',
  });
});

// Section 9: API v1 Route Registration
// Each route module handles a specific resource/domain area.
// Why: Keeps routes modular and organized by feature. Each file contains its own middleware chain (auth, validation, etc.).
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/admin', require('./routes/admin.routes'));
app.use('/api/v1/test', require('./routes/test.routes'));
app.use('/api/v1/protected', require('./routes/protected.routes'));
app.use('/api/v1/shops', require('./routes/shop.routes'));
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/deals', require('./routes/deal.routes'));
app.use('/api/v1/favorites', require('./routes/favorite.routes'));
app.use('/api/v1/reviews', require('./routes/review.routes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/interactions', require('./routes/interaction.routes'));
app.use('/api/v1/docs', require('./routes/docs.routes'));
app.use('/api/v1/health', require('./routes/health.routes'));
app.use('/api/v1/uploads', require('./routes/upload.routes'));
app.use('/api/v1/analytics', require('./routes/analytics.routes'));
app.use('/api/v1/ai', require('./routes/ai.routes'));

// Section 10: Error Handling Middleware
// - notFound: catches any request that didn't match a route above and creates a 404 error, then forwards it to errorHandler.
// - errorHandler: final catch-all that logs the error and sends a consistent JSON error response to the client.
// Why: Must be registered LAST so they only trigger when no route matched.
app.use(notFound);
app.use(errorHandler);

module.exports = app;