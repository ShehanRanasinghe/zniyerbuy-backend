// Health Check Controller

// Provides a lightweight endpoint for monitoring services and load balancers to verify the API is running and responsive.
// Why: Health checks are essential for production deployments.
// Monitoring tools (AWS ALB, Kubernetes probes, UptimeRobot) poll this endpoint to detect downtime and trigger alerts or auto-restarts.

// Section 1: Health Check
// GET /api/v1/health
// Returns server health status including:
//   - status: 'healthy' indicates the server is operational
//   - uptime: seconds since the Node.js process started
//   - timestamp: when this request was received (from requestTime middleware)
// Why include uptime: Helps ops teams see if the server recently restarted (low uptime may indicate crash-restart loops).

exports.healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: req.requestTime,
  });
};