/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('renz_inventory', tbl => {
        tbl.increments('id').primary();
        tbl.string('item_name', 255).notNullable().unique();
        tbl.integer('count').notNullable().defaultTo(0);
    })
    .then(() => knex('renz_inventory').insert([
        { item_name: 'gochugang mayo tuna' },
        { item_name: 'gochugang mayo salmon' },
        { item_name: 'miso glaze tuna' },
        { item_name: 'miso glaze salmon' },
        { item_name: 'spicy garlic edamame' },
        { item_name: 'asian slaw' },
        { item_name: 'spicy tuna inari bomb' },
        { item_name: 'california inari bomb' },
        { item_name: 'white rice' },
        { item_name: 'sushi rice' },
        { item_name: 'spam fried rice' },
        { item_name: 'kimchi spam fried rice' },
        { item_name: 'spam musubi fried rice' },
        { item_name: 'musubi' },
        { item_name: 'kimchi fried rice musubi' },
        { item_name: 'teriyaki tuna' },
        { item_name: 'teriyaki salmon' },
        { item_name: 'cucumber salad' },
        { item_name: 'teriyaki salmon inari bomb' },
        { item_name: 'hawaiian sun' }
    ]));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('renz_inventory');
};
