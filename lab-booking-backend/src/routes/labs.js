/**
 * Lab routes.
 *
 * GET /api/v1/labs       — List all labs (paginated)
 * GET /api/v1/labs/:id   — Get lab details
 * GET /api/v1/labs/:id/equipment — Get lab equipment
 */
import { Router } from 'express';
import db from '../db/knex.js';
import { requireAuth } from '../middleware/auth.js';
import { success, paginated } from '../utils/response.js';
import { parsePagination, buildLinkHeaders } from '../utils/pagination.js';

const router = Router();

/**
 * GET /labs
 * Paginated list of labs.
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req.query);

    const [{ count }] = await db('labs').count('* as count');
    const total = parseInt(count, 10);

    const labs = await db('labs')
      .select('id', 'name', 'room', 'capacity', 'status', 'description', 'created_at', 'updated_at')
      .orderBy('name', 'asc')
      .limit(limit)
      .offset(offset);

    // Build Link headers
    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const linkHeader = buildLinkHeaders(baseUrl, req.query, total, limit, offset);

    res.set('Link', linkHeader);
    res.set('X-Total-Count', total);
    return res.json(paginated(labs, { limit, offset, total }));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /labs/:id
 * Get a single lab with equipment count.
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const lab = await db('labs')
      .select(
        'labs.*',
        db.raw('(SELECT COUNT(*) FROM equipment WHERE lab_id = labs.id) as equipment_count')
      )
      .where({ 'labs.id': req.params.id })
      .first();

    if (!lab) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: 'Lab not found', statusCode: 404, details: null },
        meta: null,
      });
    }

    return res.json(success(lab));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /labs/:id/equipment
 * Get all equipment for a lab.
 */
router.get('/:id/equipment', requireAuth, async (req, res, next) => {
  try {
    const lab = await db('labs').where({ id: req.params.id }).first();
    if (!lab) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: 'Lab not found', statusCode: 404, details: null },
        meta: null,
      });
    }

    const equipment = await db('equipment')
      .select('id', 'name', 'quantity', 'condition')
      .where({ lab_id: req.params.id })
      .orderBy('name', 'asc');

    return res.json(success(equipment));
  } catch (err) {
    next(err);
  }
});

export default router;
