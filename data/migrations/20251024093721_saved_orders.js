/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create saved_orders table
  await knex.schema.createTable('saved_orders', function (tbl) {
    tbl.increments('id').primary();
    tbl.timestamp('created_at').defaultTo(knex.fn.now());
    tbl.timestamp('updated_at').defaultTo(knex.fn.now());
    tbl.integer('loyalty_member_id')
      .unsigned()
      .references('id')
      .inTable('renz_loyalty')
      .onDelete('SET NULL');
    tbl.decimal('subtotal', 10, 2).notNullable();
    tbl.integer('points_used').notNullable().defaultTo(0);
    tbl.decimal('total_amount', 10, 2).notNullable();
  });

  // Create saved_order_items table
  await knex.schema.createTable('saved_order_items', function (tbl) {
    tbl.increments('id').primary();
    tbl.integer('saved_order_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('saved_orders')
      .onDelete('CASCADE'); // Delete items when saved order is deleted
    tbl.integer('item_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('renz_inventory')
      .onDelete('RESTRICT'); // Prevent inventory deletion if in saved orders
    tbl.integer('quantity').notNullable();
    tbl.decimal('price_at_purchase', 10, 2).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('saved_order_items');
  await knex.schema.dropTableIfExists('saved_orders');
};
