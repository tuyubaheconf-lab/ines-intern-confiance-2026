/**
 * Create equipment table
 */
export function up(knex) {
  return knex.schema.createTable('equipment', (table) => {
    table.increments('id').primary();
    table.integer('lab_id').unsigned().notNullable().references('id').inTable('labs').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.integer('quantity').unsigned().notNullable().defaultTo(1);
    table.enum('condition', ['good', 'fair', 'poor', 'broken']).notNullable().defaultTo('good');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('lab_id');
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('equipment');
}
