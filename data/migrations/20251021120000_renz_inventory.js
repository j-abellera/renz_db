/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('renz_inventory', tbl => {
        tbl.increments('id').primary();
        tbl.string('item_name', 255).notNullable().unique();
        tbl.string('category', 50).notNullable();
        tbl.integer('count').notNullable().defaultTo(0);
    })
    .then(() => knex('renz_inventory').insert([
        // poke
        { item_name: 'gochugang mayo tuna', category: 'poke' },
        { item_name: 'gochugang mayo salmon', category: 'poke' },
        { item_name: 'miso glaze tuna', category: 'poke' },
        { item_name: 'miso glaze salmon', category: 'poke' },
        { item_name: 'teriyaki tuna', category: 'poke' },
        { item_name: 'teriyaki salmon', category: 'poke' },

        // bombs
        { item_name: 'spicy tuna inari bomb', category: 'bombs' },
        { item_name: 'california inari bomb', category: 'bombs' },
        { item_name: 'teriyaki salmon inari bomb', category: 'bombs' },

        // rice
        { item_name: 'white rice', category: 'rice' },
        { item_name: 'sushi rice', category: 'rice' },
        { item_name: 'spam fried rice', category: 'rice' },
        { item_name: 'kimchi spam fried rice', category: 'rice' },

        // musubi
        { item_name: 'spam musubi', category: 'musubi' },
        { item_name: 'fried rice musubi', category: 'musubi' },
        { item_name: 'kimchi fried rice musubi', category: 'musubi' },

        // sides
        { item_name: 'spicy garlic edamame', category: 'sides' },
        { item_name: 'asian slaw', category: 'sides' },
        { item_name: 'cucumber salad', category: 'sides' },

        // drinks
        { item_name: 'hawaiian sun', category: 'drinks' }
    ]));
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('renz_inventory');
};
