/**
 * Server entry point.
 */
import config from './config/index.js';
import app from './app.js';

const server = app.listen(config.port, config.host, () => {
  console.log(`[SERVER] INES Lab Booking API running on http://${config.host}:${config.port}`);
  console.log(`[SERVER] Environment: ${config.env}`);
  if (config.isDev) {
    console.log(`[SERVER] Swagger UI: http://${config.host}:${config.port}/docs`);
    console.log(`[SERVER] Health check: http://${config.host}:${config.port}/api/v1/health`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

export default server;
