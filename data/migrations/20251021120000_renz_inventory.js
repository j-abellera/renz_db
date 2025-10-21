/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('renz_inventory', tbl => {
        tbl.increments('id').primary();
        tbl.string('item_name', 255).notNullable().unique();
        tbl.string('category', 50).notNullable();
        tbl.decimal('price', 6, 2).notNullable().defaultTo(0);
        tbl.integer('count').notNullable().defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('renz_inventory');
};
