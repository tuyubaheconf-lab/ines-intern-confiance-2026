import 'dotenv/config';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 4000,
  host: process.env.HOST || '0.0.0.0',
  isDev: (process.env.NODE_ENV || 'development') !== 'production',
  isTest: process.env.NODE_ENV === 'test',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'ines_lab_booking',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  rateLimit: {
    login: {
      windowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS, 10) || 60_000,
      max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 5,
    },
  },
};

export default config;
