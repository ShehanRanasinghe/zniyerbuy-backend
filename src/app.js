const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ZNIYERBUY API is running',
  });
});

app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/test', require('./routes/test.routes'));
app.use('/api/v1/protected', require('./routes/protected.routes'));
app.use('/api/v1/shops', require('./routes/shop.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;