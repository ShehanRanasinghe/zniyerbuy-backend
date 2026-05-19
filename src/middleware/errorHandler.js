const { logError } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logError(err.message);

  res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
};

module.exports = errorHandler;