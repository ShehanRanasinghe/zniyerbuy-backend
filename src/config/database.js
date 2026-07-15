// Sequelize Database Configuration
// Defines database connections for development, test, and production environments.
// Uses the DATABASE_URL environment variable to connect to Supabase PostgreSQL, and configures SSL dialect options necessary for secure Supabase connections.

require('dotenv').config();

const dbConfig = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

module.exports = {
  development: {
    use_env_variable: 'DATABASE_URL',
    ...dbConfig
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    ...dbConfig
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    ...dbConfig
  }
};
