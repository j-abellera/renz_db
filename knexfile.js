// Update with your config settings.
require('dotenv').config({ path: '.env' });
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/renz_loyalty.db3'
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: {
      directory: './data/seeds'
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'pg',
    connection: {
      database: process.env.POSTGRES_DATABASE,
      host:     process.env.POSTGRES_HOST,
      user:     process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: true
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
