/**
 * Booking routes.
 *
 * GET    /api/v1/bookings       — List all bookings (paginated, coordinators only)
 * GET    /api/v1/bookings/my    — List current user's bookings (paginated)
 * POST   /api/v1/bookings       — Create a new booking
 * PATCH  /api/v1/bookings/:id/approve — Approve/reject a booking (coordinators only)
 */
import { Router } from 'express';
import db from '../db/knex.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, updateBookingStatusSchema } from '../schemas/booking.js';
import { success, paginated } from '../utils/response.js';
import { parsePagination, buildLinkHeaders } from '../utils/pagination.js';

/**
 * Log an approval action to the approval_logs table.
 */
async function logApproval(knexTrx, bookingId, performedBy, action, reason) {
  await knexTrx('approval_logs').insert({
    booking_id: bookingId,
    performed_by: performedBy,
    action,
    reason: reason || null,
    created_at: new Date(),
  });
}

const router = Router();

/**
 * GET /bookings
 * List all bookings (paginated). Lab-coordinators only.
 */
router.get('/', requireAuth, requireRole('lab-coordinator'), async (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req.query);

    let query = db('bookings')
      .join('users', 'bookings.user_id', 'users.id')
      .join('labs', 'bookings.lab_id', 'labs.id')
      .select(
        'bookings.id',
        'bookings.booking_date',
        'bookings.time_slot',
        'bookings.student_count',
        'bookings.purpose',
        'bookings.status',
        'bookings.rejection_reason',
        'bookings.created_at',
        'bookings.updated_at',
        'users.id as user_id',
        'users.full_name as user_name',
        'users.email as user_email',
        'labs.id as lab_id',
        'labs.name as lab_name',
        'labs.room as lab_room'
      );

    // Filters
    if (req.query.status) {
      query = query.where('bookings.status', req.query.status);
    }
    if (req.query.lab_id) {
      query = query.where('bookings.lab_id', parseInt(req.query.lab_id, 10));
    }
    if (req.query.booking_date) {
      query = query.where('bookings.booking_date', req.query.booking_date);
    }

    // Count total for pagination
    const countQuery = query.clone().clearSelect().count('* as count').first();
    const total = parseInt((await countQuery).count, 10);

    const bookings = await query
      .orderBy('bookings.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const linkHeader = buildLinkHeaders(baseUrl, req.query, total, limit, offset);

    res.set('Link', linkHeader);
    res.set('X-Total-Count', total);
    return res.json(paginated(bookings, { limit, offset, total }));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /bookings/my
 * List current user's bookings (paginated).
 */
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const { limit, offset } = parsePagination(req.query);

    const countQuery = db('bookings')
      .where({ user_id: req.user.id })
      .count('* as count')
      .first();
    const total = parseInt((await countQuery).count, 10);

    const bookings = await db('bookings')
      .join('labs', 'bookings.lab_id', 'labs.id')
      .select(
        'bookings.id',
        'bookings.booking_date',
        'bookings.time_slot',
        'bookings.student_count',
        'bookings.purpose',
        'bookings.status',
        'bookings.rejection_reason',
        'bookings.created_at',
        'bookings.updated_at',
        'labs.id as lab_id',
        'labs.name as lab_name',
        'labs.room as lab_room'
      )
      .where({ 'bookings.user_id': req.user.id })
      .orderBy('bookings.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const linkHeader = buildLinkHeaders(baseUrl, req.query, total, limit, offset);

    res.set('Link', linkHeader);
    res.set('X-Total-Count', total);
    return res.json(paginated(bookings, { limit, offset, total }));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /bookings
 * Create a new booking.
 */
router.post('/', requireAuth, validate(createBookingSchema), async (req, res, next) => {
  try {
    const { lab_id, booking_date, time_slot, student_count, purpose } = req.body;

    // Check lab exists
    const lab = await db('labs').where({ id: lab_id }).first();
    if (!lab) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: 'Lab not found', statusCode: 404, details: null },
        meta: null,
      });
    }

    if (lab.status === 'maintenance') {
      return res.status(409).json({
        success: false,
        data: null,
        error: { message: 'Lab is under maintenance and cannot be booked', statusCode: 409, details: null },
        meta: null,
      });
    }

    // Check capacity
    if (student_count > lab.capacity) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { message: `Student count exceeds lab capacity of ${lab.capacity}`, statusCode: 400, details: null },
        meta: null,
      });
    }

    // Check for overlapping booking
    const existing = await db('bookings')
      .where({ lab_id, booking_date, time_slot })
      .whereIn('status', ['pending', 'approved'])
      .first();

    if (existing) {
      return res.status(409).json({
        success: false,
        data: null,
        error: { message: 'This time slot is already booked or pending approval', statusCode: 409, details: null },
        meta: null,
      });
    }

    const [bookingId] = await db('bookings').insert({
      user_id: req.user.id,
      lab_id,
      booking_date,
      time_slot,
      student_count,
      purpose,
      status: 'pending',
    }).returning('id');

    const booking = await db('bookings')
      .join('labs', 'bookings.lab_id', 'labs.id')
      .select(
        'bookings.*',
        'labs.name as lab_name',
        'labs.room as lab_room'
      )
      .where({ 'bookings.id': bookingId.id || bookingId })
      .first();

    return res.status(201).json(success(booking));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /bookings/:id/approve
 * Approve or reject a booking (lab-coordinator only).
 */
router.patch('/:id/approve', requireAuth, requireRole('lab-coordinator'), validate(updateBookingStatusSchema), async (req, res, next) => {
  try {
    const booking = await db('bookings').where({ id: req.params.id }).first();
    if (!booking) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: 'Booking not found', statusCode: 404, details: null },
        meta: null,
      });
    }

    if (booking.status !== 'pending') {
      return res.status(409).json({
        success: false,
        data: null,
        error: { message: `Booking is already ${booking.status}. Cannot change status.`, statusCode: 409, details: null },
        meta: null,
      });
    }

    const { status, rejection_reason } = req.body;

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Rejection reason is required when rejecting a booking', statusCode: 400, details: null },
        meta: null,
      });
    }

    await db('bookings')
      .where({ id: req.params.id })
      .update({
        status,
        approved_by: req.user.id,
        rejection_reason: rejection_reason || null,
        updated_at: new Date(),
      });

    // Log the approval/rejection action
    await logApproval(db, req.params.id, req.user.id, status, rejection_reason);

    const updated = await db('bookings')
      .join('users', 'bookings.user_id', 'users.id')
      .join('labs', 'bookings.lab_id', 'labs.id')
      .select(
        'bookings.*',
        'users.full_name as user_name',
        'users.email as user_email',
        'labs.name as lab_name',
        'labs.room as lab_room'
      )
      .where({ 'bookings.id': req.params.id })
      .first();

    return res.json(success(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * Format booking_date from Date to YYYY-MM-DD string for consistent JSON output.
 */
function formatBookingDate(booking) {
  if (!booking) return booking;
  if (booking.booking_date instanceof Date || (typeof booking.booking_date === 'string' && booking.booking_date.includes('T'))) {
    const d = new Date(booking.booking_date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    booking.booking_date = `${year}-${month}-${day}`;
  }
  return booking;
}

/**
 * Format booking_date on every booking object in an array or single object.
 */
function formatBookingDates(data) {
  if (Array.isArray(data)) {
    data.forEach(formatBookingDate);
  } else {
    formatBookingDate(data);
  }
  return data;
}

export default router;
