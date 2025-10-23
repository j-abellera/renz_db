/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// In a Knex migration file for the 'order_items' table
exports.up = function (knex) {
    return knex.schema.createTable('order_items', function (tbl) {
        tbl.increments('id').primary();
        tbl.integer('order_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('orders')
            .onDelete('CASCADE'); // If an order is deleted, its items are deleted too
        tbl.integer('item_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('renz_inventory')
            .onDelete('RESTRICT'); // Prevents deleting an item that has been sold
        tbl.integer('quantity').notNullable();
        tbl.decimal('price_at_purchase', 6, 2).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('order_items');
};
