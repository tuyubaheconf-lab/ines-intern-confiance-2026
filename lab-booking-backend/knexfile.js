import 'dotenv/config';

const config = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'ines_lab_booking',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: './src/db/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'js',
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: (process.env.DB_NAME || 'ines_lab_booking') + '_test',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: './src/db/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'js',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './src/db/migrations',
      extension: 'js',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'js',
    },
  },
};

export default config;
