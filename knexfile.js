// Update with your config settings.
require('dotenv').config({ path: '.env' });
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: process.env.DEV_DB_HOST || 'localhost',
      port: process.env.DEV_DB_PORT || 5432,
      database: process.env.DEV_DB_NAME || 'renz_loyalty_dev',
      user: process.env.DEV_DB_USER || 'postgres',
      password: process.env.DEV_DB_PASSWORD || 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: {
      directory: './data/seeds'
    }
  },

  test: {
    client: 'pg',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 5432,
      database: process.env.TEST_DB_NAME || 'renz_loyalty_test',
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || 'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: {
      directory: './data/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: {
      directory: './data/seeds'
    }
  }

};
