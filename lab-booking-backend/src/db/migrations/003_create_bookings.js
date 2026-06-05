/**
 * Create bookings table
 */
export function up(knex) {
  return knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('lab_id').unsigned().notNullable().references('id').inTable('labs').onDelete('CASCADE');
    table.date('booking_date').notNullable();
    table.string('time_slot', 20).notNullable();
    table.integer('student_count').unsigned().notNullable();
    table.text('purpose').notNullable();
    table.enum('status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.text('rejection_reason').nullable();
    table.integer('approved_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['lab_id', 'booking_date', 'time_slot'], 'uq_lab_date_slot');
    table.index('user_id');
    table.index('lab_id');
    table.index('status');
    table.index('booking_date');
    table.index(['lab_id', 'booking_date']);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('bookings');
}
