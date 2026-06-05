/**
 * Create approval_logs table
 * Tracks every approval/rejection action on bookings for audit trail.
 */
export function up(knex) {
  return knex.schema.createTable('approval_logs', (table) => {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().notNullable().references('id').inTable('bookings').onDelete('CASCADE');
    table.integer('performed_by').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('action', ['approved', 'rejected']).notNullable();
    table.text('reason').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('booking_id');
    table.index('performed_by');
    table.index('action');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('approval_logs');
}
