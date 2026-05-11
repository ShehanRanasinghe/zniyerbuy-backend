const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

app.use('/api/v1/test', require('./routes/test.routes'));
app.use('/api/v1/protected', require('./routes/protected.routes'));

module.exports = app;