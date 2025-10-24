/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('orders', function (tbl) {
    tbl.string('external_order_id', 100).unique();
    tbl.boolean('is_legacy').notNullable().defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('orders', function (tbl) {
    tbl.dropColumn('external_order_id');
    tbl.dropColumn('is_legacy');
  });
};
