/**
 * Route aggregator.
 * Mounts all route modules under /api/v1.
 */
import { Router } from 'express';
import authRoutes from './auth.js';
import labRoutes from './labs.js';
import bookingRoutes from './bookings.js';

const router = Router();

router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/labs', labRoutes);
router.use('/api/v1/bookings', bookingRoutes);

// Health check
router.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() }, error: null, meta: null });
});

export default router;
