import { z } from 'zod';

export const createLabSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  room: z.string().min(1, 'Room is required').max(50),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  description: z.string().max(500).optional(),
});

export const updateLabSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  room: z.string().min(1).max(50).optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
  description: z.string().max(500).optional(),
});
