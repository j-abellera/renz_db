/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('renz_loyalty', tbl => {
        tbl.increments('id').primary();
        tbl.string('name', 255).notNullable();
        tbl.string('phone_number').notNullable().unique();
        tbl.integer('points').notNullable().defaultTo();
        tbl.timestamp('created_at').defaultTo(knex.fn.now());
        tbl.timestamp('updated_at').defaultTo(knex.fn.now());
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('renz_loyalty');
};
