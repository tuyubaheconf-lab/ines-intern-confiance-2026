import bcrypt from 'bcryptjs';

const hash = bcrypt.hashSync('password123', 10);

const now = new Date();

const users = [
  { id: 1, email: 'student@ines.ac.rw',         password_hash: hash, full_name: 'Mugisha Jean',           role: 'student',         is_active: true, created_at: now, updated_at: now },
  { id: 2, email: 'lecturer@ines.ac.rw',        password_hash: hash, full_name: 'Dr. Uwase Marie',         role: 'lecturer',        is_active: true, created_at: now, updated_at: now },
  { id: 3, email: 'coordinator@ines.ac.rw',     password_hash: hash, full_name: 'Clementine Nyiraneza',    role: 'lab-coordinator', is_active: true, created_at: now, updated_at: now },
  { id: 4, email: 'alice@ines.ac.rw',           password_hash: hash, full_name: 'Alice Mukamana',          role: 'student',         is_active: true, created_at: now, updated_at: now },
  { id: 5, email: 'bob@ines.ac.rw',             password_hash: hash, full_name: 'Bob Habimana',            role: 'student',         is_active: true, created_at: now, updated_at: now },
  { id: 6, email: 'diana@ines.ac.rw',           password_hash: hash, full_name: 'Dr. Diana Uwimana',       role: 'lecturer',        is_active: true, created_at: now, updated_at: now },
  { id: 7, email: 'eve@ines.ac.rw',             password_hash: hash, full_name: 'Eve Ishimwe',             role: 'lecturer',        is_active: true, created_at: now, updated_at: now },
  { id: 8, email: 'frank@ines.ac.rw',           password_hash: hash, full_name: 'Frank Niyonzima',         role: 'lab-coordinator', is_active: true, created_at: now, updated_at: now },
  { id: 9, email: 'admin@ines.ac.rw',           password_hash: hash, full_name: 'Admin System',            role: 'admin',           is_active: true, created_at: now, updated_at: now },
];

const labs = [
  { id: 1, name: 'Software & AI Lab',        room: 'B201', capacity: 30, status: 'available',   description: 'Modern software engineering and AI/ML development lab', created_at: now, updated_at: now },
  { id: 2, name: 'Network & Cybersecurity Lab', room: 'A105', capacity: 25, status: 'occupied',   description: 'Networking equipment and cybersecurity testing environment', created_at: now, updated_at: now },
  { id: 3, name: 'IoT & Robotics Lab',       room: 'C310', capacity: 20, status: 'available',   description: 'IoT devices, sensors, and robotics prototyping lab', created_at: now, updated_at: now },
  { id: 4, name: 'General Computer Lab',      room: 'D102', capacity: 40, status: 'available',   description: 'General-purpose computer lab for all students', created_at: now, updated_at: now },
];

const today = '2026-06-02';
const tomorrow = '2026-06-03';
const dayAfter = '2026-06-04';

const bookings = [
  { id: 1, user_id: 1, lab_id: 1, booking_date: today,     time_slot: '10:00-12:00', student_count: 25, purpose: 'Final year project presentations', status: 'approved',  approved_by: 3, rejection_reason: null, created_at: now, updated_at: now },
  { id: 2, user_id: 2, lab_id: 3, booking_date: tomorrow,  time_slot: '08:00-10:00', student_count: 20, purpose: 'Arduino & ESP32 workshop',          status: 'approved',  approved_by: 3, rejection_reason: null, created_at: now, updated_at: now },
  { id: 3, user_id: 1, lab_id: 2, booking_date: dayAfter,  time_slot: '14:00-16:00', student_count: 18, purpose: 'Network configuration lab',         status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 4, user_id: 4, lab_id: 1, booking_date: today,     time_slot: '08:00-10:00', student_count: 30, purpose: 'Python programming session',        status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 5, user_id: 6, lab_id: 1, booking_date: tomorrow,  time_slot: '10:00-12:00', student_count: 28, purpose: 'Database design lecture',           status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 6, user_id: 5, lab_id: 3, booking_date: today,     time_slot: '10:00-12:00', student_count: 15, purpose: 'Robotics club meeting',             status: 'rejected',  approved_by: 3, rejection_reason: 'Lab under maintenance', created_at: now, updated_at: now },
  { id: 7, user_id: 7, lab_id: 2, booking_date: tomorrow,  time_slot: '08:00-10:00', student_count: 22, purpose: 'Ethical hacking workshop',          status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 8, user_id: 2, lab_id: 4, booking_date: dayAfter,  time_slot: '10:00-12:00', student_count: 35, purpose: 'Web development lab session',      status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 9, user_id: 1, lab_id: 1, booking_date: today,     time_slot: '13:00-15:00', student_count: 20, purpose: 'Code review session',               status: 'approved',  approved_by: 8, rejection_reason: null, created_at: now, updated_at: now },
  { id: 10, user_id: 6, lab_id: 4, booking_date: today,    time_slot: '08:00-10:00', student_count: 38, purpose: 'Introduction to databases',         status: 'approved',  approved_by: 3, rejection_reason: null, created_at: now, updated_at: now },
  { id: 11, user_id: 5, lab_id: 2, booking_date: today,    time_slot: '10:00-12:00', student_count: 20, purpose: 'Cyber range exercise',             status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 12, user_id: 7, lab_id: 3, booking_date: today,    time_slot: '13:00-15:00', student_count: 18, purpose: 'IoT sensor calibration',           status: 'approved',  approved_by: 3, rejection_reason: null, created_at: now, updated_at: now },
  { id: 13, user_id: 4, lab_id: 3, booking_date: tomorrow, time_slot: '10:00-12:00', student_count: 16, purpose: 'Robotics project work',             status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 14, user_id: 2, lab_id: 1, booking_date: today,    time_slot: '15:00-17:00', student_count: 25, purpose: 'Software engineering lecture',      status: 'rejected',  approved_by: 8, rejection_reason: 'Time slot already booked', created_at: now, updated_at: now },
  { id: 15, user_id: 6, lab_id: 2, booking_date: today,    time_slot: '13:00-15:00', student_count: 20, purpose: 'Network protocol analysis',        status: 'approved',  approved_by: 3, rejection_reason: null, created_at: now, updated_at: now },
  { id: 16, user_id: 1, lab_id: 4, booking_date: today,    time_slot: '10:00-12:00', student_count: 30, purpose: 'General study session',            status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 17, user_id: 5, lab_id: 4, booking_date: tomorrow, time_slot: '10:00-12:00', student_count: 35, purpose: 'Group project meeting',             status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 18, user_id: 7, lab_id: 1, booking_date: tomorrow, time_slot: '13:00-15:00', student_count: 22, purpose: 'Research seminar',                  status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 19, user_id: 4, lab_id: 2, booking_date: dayAfter, time_slot: '08:00-10:00', student_count: 20, purpose: 'Network security assessment',       status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
  { id: 20, user_id: 6, lab_id: 3, booking_date: tomorrow, time_slot: '13:00-15:00', student_count: 18, purpose: 'IoT product development',          status: 'pending',   approved_by: null, rejection_reason: null, created_at: now, updated_at: now },
];

const equipment = [
  { id: 1, lab_id: 1, name: 'Workstations',    quantity: 30, condition: 'good',  created_at: now, updated_at: now },
  { id: 2, lab_id: 1, name: 'Projector',       quantity: 1,  condition: 'good',  created_at: now, updated_at: now },
  { id: 3, lab_id: 2, name: 'Routers',         quantity: 8,  condition: 'good',  created_at: now, updated_at: now },
  { id: 4, lab_id: 2, name: 'Switches',        quantity: 6,  condition: 'good',  created_at: now, updated_at: now },
  { id: 5, lab_id: 2, name: 'Firewall Appliances', quantity: 2, condition: 'good', created_at: now, updated_at: now },
  { id: 6, lab_id: 3, name: 'Arduino Kits',    quantity: 15, condition: 'good',  created_at: now, updated_at: now },
  { id: 7, lab_id: 3, name: 'ESP32 Boards',    quantity: 10, condition: 'good',  created_at: now, updated_at: now },
  { id: 8, lab_id: 3, name: 'Sensors Bundle',  quantity: 20, condition: 'fair',  created_at: now, updated_at: now },
  { id: 9, lab_id: 4, name: 'Workstations',    quantity: 40, condition: 'good',  created_at: now, updated_at: now },
  { id: 10, lab_id: 4, name: 'Printer',        quantity: 1,  condition: 'fair',  created_at: now, updated_at: now },
];

const approvalLogs = [
  { id: 1, booking_id: 1, performed_by: 3, action: 'approved', reason: null,                      created_at: now },
  { id: 2, booking_id: 2, performed_by: 3, action: 'approved', reason: null,                      created_at: now },
  { id: 3, booking_id: 6, performed_by: 3, action: 'rejected', reason: 'Lab under maintenance',   created_at: now },
  { id: 4, booking_id: 9, performed_by: 8, action: 'approved', reason: null,                      created_at: now },
  { id: 5, booking_id: 10, performed_by: 3, action: 'approved', reason: null,                     created_at: now },
  { id: 6, booking_id: 12, performed_by: 3, action: 'approved', reason: null,                     created_at: now },
  { id: 7, booking_id: 14, performed_by: 8, action: 'rejected', reason: 'Time slot already booked', created_at: now },
  { id: 8, booking_id: 15, performed_by: 3, action: 'approved', reason: null,                     created_at: now },
];

/**
 * Idempotent seed — clear data first, then insert.
 */
export async function seed(knex) {
  await knex('approval_logs').del();
  await knex('equipment').del();
  await knex('bookings').del();
  await knex('labs').del();
  await knex('users').del();

  await knex('users').insert(users);
  await knex('labs').insert(labs);
  await knex('bookings').insert(bookings);
  await knex('equipment').insert(equipment);
  await knex('approval_logs').insert(approvalLogs);

  // Reset sequences
  await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
  await knex.raw("SELECT setval('labs_id_seq', (SELECT MAX(id) FROM labs))");
  await knex.raw("SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings))");
  await knex.raw("SELECT setval('equipment_id_seq', (SELECT MAX(id) FROM equipment))");
  await knex.raw("SELECT setval('approval_logs_id_seq', (SELECT MAX(id) FROM approval_logs))");
}
