/**
 * Create users table
 */
export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('full_name', 255).notNullable();
    table.enum('role', ['student', 'lecturer', 'lab-coordinator', 'admin']).notNullable().defaultTo('student');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.text('refresh_token').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('email');
    table.index('role');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('users');
}
