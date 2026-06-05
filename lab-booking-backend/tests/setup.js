/**
 * Test setup for Jest + supertest.
 *
 * Sets NODE_ENV=test, creates a test database connection,
 * and exports the app for supertest usage.
 */
import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.DB_NAME = 'ines_lab_booking_test';

// Increase Jest timeout for slow operations
jest.setTimeout(30000);
