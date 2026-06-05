import { z } from 'zod';

export const createBookingSchema = z.object({
  lab_id: z.number().int().positive('Lab ID must be a positive integer'),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format'),
  time_slot: z.enum(['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00'], {
    errorMap: () => ({ message: 'Time slot must be one of: 08:00-10:00, 10:00-12:00, 13:00-15:00, 15:00-17:00' }),
  }),
  student_count: z.number().int().positive('Student count must be a positive integer'),
  purpose: z.string().min(3, 'Purpose must be at least 3 characters').max(500, 'Purpose must not exceed 500 characters'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], { errorMap: () => ({ message: 'Status must be "approved" or "rejected"' }) }),
  rejection_reason: z.string().min(1, 'Rejection reason is required when rejecting').optional(),
});
