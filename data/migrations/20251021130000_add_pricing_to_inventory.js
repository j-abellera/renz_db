/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('renz_inventory', tbl => {
        tbl.decimal('price', 6, 2).notNullable().defaultTo(0);
    })
    .then(() => {
        // Update prices for each item
        const priceUpdates = [
            { item_name: 'gochugang mayo tuna', price: 9.50 },
            { item_name: 'gochugang mayo salmon', price: 9.50 },
            { item_name: 'miso glaze tuna', price: 9.50 },
            { item_name: 'miso glaze salmon', price: 9.50 },
            { item_name: 'spicy garlic edamame', price: 2.50 },
            { item_name: 'asian slaw', price: 2.50 },
            { item_name: 'spicy tuna inari bomb', price: 8.00 },
            { item_name: 'california inari bomb', price: 6.00 },
            { item_name: 'white rice', price: 0.50 },
            { item_name: 'sushi rice', price: 1.00 },
            { item_name: 'spam fried rice', price: 3.50 },
            { item_name: 'kimchi spam fried rice', price: 4.50 },
            { item_name: 'spam musubi', price: 2.50 },
            { item_name: 'fried rice musubi', price: 4.00 },
            { item_name: 'kimchi fried rice musubi', price: 5.00 },
            { item_name: 'teriyaki tuna', price: 9.50 },
            { item_name: 'teriyaki salmon', price: 9.50 },
            { item_name: 'cucumber salad', price: 2.50 },
            { item_name: 'teriyaki salmon inari bomb', price: 8.00 },
            { item_name: 'hawaiian sun', price: 2.00 }
        ];

        // Execute all updates
        return Promise.all(
            priceUpdates.map(item => 
                knex('renz_inventory')
                    .where({ item_name: item.item_name })
                    .update({ price: item.price })
            )
        );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.table('renz_inventory', tbl => {
        tbl.dropColumn('price');
    });
};
