const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const compression = require('compression');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const requestTime = require('./middleware/requestTime');

const apiLimiter = require('./middleware/rateLimiter');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middlewares

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});

app.use(helmet());

app.use(compression());
app.use(limiter);

app.use(cors());
app.use(morgan('dev'));

app.use(requestTime);

app.use(express.json({ limit: '10mb' }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Health check route
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

app.use('/api/v1/auth', require('./routes/auth.routes'));
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
app.use('/api', apiLimiter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;