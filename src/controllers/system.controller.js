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