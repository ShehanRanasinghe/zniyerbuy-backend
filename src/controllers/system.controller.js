// System Information Controller

// Provides system-level health and status information about the API.
// This is separate from the health.controller.js endpoint and provides more detailed information including service name, version, and environment.
// Why separate from health.controller: This endpoint returns richer metadata (version, environment) useful for DevOps dashboards, while the health endpoint is a minimal check for load balancers.

// Section 1: Get System Health
// GET /api/v1/system/health
// Returns detailed system status including:
//   - service: the API service name
//   - version: current API version
//   - environment: the NODE_ENV value (development/production/staging)
//   - uptime: seconds since the Node.js process started
//   - timestamp: current server time in ISO format
// Why include environment: Helps ops teams confirm which environment they are querying (especially important when staging and production URLs look similar).

exports.getHealth = async (req, res) => {
  res.status(200).json({
    success: true,
    service: 'ZNIYERBUY API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};