/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('renz_inventory').del();
  await knex('renz_inventory').insert([
    // poke
    { item_name: 'gochugang mayo tuna', category: 'poke', price: 9.50, count: 10 },
    { item_name: 'gochugang mayo salmon', category: 'poke', price: 9.50, count: 10 },
    { item_name: 'miso glaze tuna', category: 'poke', price: 9.50, count: 0 },
    { item_name: 'miso glaze salmon', category: 'poke', price: 9.50, count: 10 },
    { item_name: 'teriyaki tuna', category: 'poke', price: 9.50, count: 10 },
    { item_name: 'teriyaki salmon', category: 'poke', price: 9.50, count: 10 },

    // bombs
    { item_name: 'spicy tuna inari bomb', category: 'bombs', price: 8.00, count: 0 },
    { item_name: 'california inari bomb', category: 'bombs', price: 6.00, count: 10 },
    { item_name: 'teriyaki salmon inari bomb', category: 'bombs', price: 8.00, count: 10 },

    // rice
    { item_name: 'white rice', category: 'rice', price: 0.50, count: 10 },
    { item_name: 'sushi rice', category: 'rice', price: 1.00, count: 10 },
    { item_name: 'spam fried rice', category: 'rice', price: 3.50, count: 0 },
    { item_name: 'kimchi spam fried rice', category: 'rice', price: 4.50, count: 0 },

    // musubi
    { item_name: 'spam musubi', category: 'musubi', price: 2.50, count: 10 },
    { item_name: 'fried rice musubi', category: 'musubi', price: 4.00, count: 0 },
    { item_name: 'kimchi fried rice musubi', category: 'musubi', price: 5.00, count: 10 },

    // sides
    { item_name: 'spicy garlic edamame', category: 'sides', price: 2.50, count: 10 },
    { item_name: 'asian slaw', category: 'sides', price: 2.50, count: 10 },
    { item_name: 'cucumber salad', category: 'sides', price: 2.50, count: 10 },

    // drinks
    { item_name: 'hawaiian sun', category: 'drinks', price: 2.00, count: 10 }
  ]);
};
