/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// In a Knex migration file for the 'orders' table
exports.up = function (knex) {
    return knex.schema.createTable('orders', function (tbl) {
        tbl.increments('id').primary();
        tbl.timestamp('created_at').defaultTo(knex.fn.now());
        tbl.integer('loyalty_member_id')
            .unsigned()
            .references('id')
            .inTable('renz_loyalty')
            .onDelete('SET NULL'); // Keep order history if a member is deleted
        tbl.decimal('subtotal', 10, 2).notNullable();
        // tbl.decimal('tax_amount', 10, 2).notNullable().defaultTo(0);
        tbl.integer('points_used').notNullable().defaultTo(0);
        tbl.decimal('total_amount', 10, 2).notNullable();
        // tbl.string('payment_method', 50);
        // tbl.string('status', 50).notNullable().defaultTo('Completed');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('orders');
};
