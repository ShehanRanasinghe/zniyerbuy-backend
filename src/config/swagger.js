const swaggerJsDoc = require('swagger-jsdoc');

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

module.exports = swaggerJsDoc(options);