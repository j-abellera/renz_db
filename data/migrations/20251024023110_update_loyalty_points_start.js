/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('renz_loyalty', (table) => {
    table.integer('points').notNullable().defaultTo(200).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('renz_loyalty', (table) => {
    table.integer('points').notNullable().defaultTo(0).alter();
  });
};