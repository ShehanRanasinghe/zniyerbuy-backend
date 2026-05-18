require('dotenv').config();
require('./src/config/env');

const { logInfo } = require('./src/utils/logger');

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logInfo(`Server running on http://localhost:${PORT}`);
});