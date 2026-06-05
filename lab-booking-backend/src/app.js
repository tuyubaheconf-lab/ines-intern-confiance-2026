/**
 * Express application setup.
 *
 * Configures middleware in order:
 * 1. Security (helmet, cors)
 * 2. Body parsing
 * 3. Request logging
 * 4. Swagger UI (non-production)
 * 5. API routes
 * 6. 404 handler
 * 7. Centralized error handler
 */
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import config from './config/index.js';
import { success } from './utils/response.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// 1. Security
app.use(helmet());
app.use(cors({ origin: config.isDev ? '*' : process.env.CORS_ORIGIN }));

// 2. Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Request logging
app.use(requestLogger);

// 4. Swagger UI (non-production only)
if (config.isDev) {
  const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
  try {
    const swaggerDocument = yaml.load(openapiPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'INES Lab Booking API',
      customCss: '.swagger-ui .topbar { display: none }',
    }));
    console.log('[SWAGGER] Swagger UI available at /docs');
  } catch (err) {
    console.warn('[SWAGGER] Could not load openapi.yaml:', err.message);
    app.get('/docs', (_req, res) => {
      res.send('Swagger UI unavailable: openapi.yaml not found or invalid.');
    });
  }
}

// 5. API routes
app.use(routes);

// 6. 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { message: 'Endpoint not found', statusCode: 404, details: null },
    meta: null,
  });
});

// 7. Error handler
app.use(errorHandler);

export default app;
