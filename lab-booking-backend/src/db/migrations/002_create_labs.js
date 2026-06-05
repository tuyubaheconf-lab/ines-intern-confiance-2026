/**
 * Create labs table
 */
export function up(knex) {
  return knex.schema.createTable('labs', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('room', 50).notNullable();
    table.integer('capacity').notNullable();
    table.enum('status', ['available', 'occupied', 'maintenance']).notNullable().defaultTo('available');
    table.text('description').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('status');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('labs');
}
