/**
 * Contract tests for INES Lab Booking API.
 *
 * These test the API contract — ensuring the response envelope,
 * status codes, and headers match the OpenAPI specification.
 *
 * Run with: npm test
 */
import { describe, expect, test } from '@jest/globals';
import supertest from 'supertest';
import app from '../src/app.js';
import '../tests/setup.js';

const request = supertest(app);

// We'll log in once and reuse the token
let accessToken;

describe('API Contract Tests', () => {
  /* ─── Test 1: Health Check ─────────────────────────────── */
  test('GET /api/v1/health returns standard envelope', async () => {
    const res = await request.get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('error', null);
    expect(res.body).toHaveProperty('meta', null);
    expect(res.body.data).toHaveProperty('status', 'ok');
    expect(res.body.data).toHaveProperty('timestamp');
  });

  /* ─── Test 2: Login Success ────────────────────────────── */
  test('POST /api/v1/auth/login returns tokens for valid credentials', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: 'student@ines.ac.rw', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).toHaveProperty('email', 'student@ines.ac.rw');
    expect(res.body.data.user).toHaveProperty('role', 'student');
    expect(res.body.error).toBeNull();

    // Save token for subsequent tests
    accessToken = res.body.data.accessToken;
  });

  /* ─── Test 3: Login Failure ────────────────────────────── */
  test('POST /api/v1/auth/login returns 401 for wrong password', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: 'student@ines.ac.rw', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toHaveProperty('message', 'Invalid email or password');
    expect(res.body.error).toHaveProperty('statusCode', 401);
  });

  /* ─── Test 4: List Labs (paginated) ────────────────────── */
  test('GET /api/v1/labs returns paginated labs with Link headers', async () => {
    const res = await request
      .get('/api/v1/labs?limit=2&offset=0')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta).toHaveProperty('pagination');
    expect(res.body.meta.pagination).toHaveProperty('limit', 2);
    expect(res.body.meta.pagination).toHaveProperty('offset', 0);
    expect(res.body.meta.pagination).toHaveProperty('total');
    expect(res.body.meta.pagination).toHaveProperty('hasMore');
    expect(res.body.error).toBeNull();

    // Check Link header
    expect(res.headers).toHaveProperty('link');
    expect(res.headers).toHaveProperty('x-total-count');
    expect(typeof res.headers['link']).toBe('string');
    expect(res.headers['link']).toContain('rel="first"');
    expect(res.headers['link']).toContain('rel="last"');

    // Spot-check lab shape
    if (res.body.data.length > 0) {
      const lab = res.body.data[0];
      expect(lab).toHaveProperty('id');
      expect(lab).toHaveProperty('name');
      expect(lab).toHaveProperty('room');
      expect(lab).toHaveProperty('capacity');
      expect(lab).toHaveProperty('status');
    }
  });

  /* ─── Test 5: Create Booking ───────────────────────────── */
  test('POST /api/v1/bookings creates a booking and returns standard envelope', async () => {
    const res = await request
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        lab_id: 4,                  // General Computer Lab
        booking_date: '2026-06-10',
        time_slot: '10:00-12:00',
        student_count: 20,
        purpose: 'Contract test booking',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('lab_id', 4);
    expect(res.body.data).toHaveProperty('booking_date', '2026-06-10');
    expect(res.body.data).toHaveProperty('time_slot', '10:00-12:00');
    expect(res.body.data).toHaveProperty('status', 'pending');
    expect(res.body.data).toHaveProperty('lab_name', 'General Computer Lab');
    expect(res.body.error).toBeNull();

  });

  /* ─── Test 6: My Bookings ────────────────────────── */
  test('GET /api/v1/bookings/my returns user bookings', async () => {
    const res = await request
      .get('/api/v1/bookings/my')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('pagination');
  });

  /* ─── Test 7: Unauthorized access ────────────────────── */
  test('GET /api/v1/labs returns 401 without token', async () => {
    const res = await request.get('/api/v1/labs');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('message');
  });

  /* ─── Test 8: Validation error ─────────────────────────── */
  test('POST /api/v1/bookings returns 400 for invalid input', async () => {
    const res = await request
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        lab_id: -1,
        booking_date: 'invalid-date',
        time_slot: 'invalid-slot',
        student_count: -5,
        purpose: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toHaveProperty('message', 'Validation failed');
    expect(res.body.error).toHaveProperty('details');
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });
});
