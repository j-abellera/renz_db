// seeds/03_orders_and_items.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries in reverse order of creation
  await knex('order_items').del();
  await knex('orders').del();

  // fetch a couple of existing loyalty members if any
  const loyalty = await knex('renz_loyalty').select('id').orderBy('id', 'asc');
  const lm1 = loyalty[0]?.id || null;
  const lm2 = loyalty[1]?.id || null;

  // Insert orders and capture IDs (PostgreSQL returns array of ids or objects depending on version)
  const inserted = await knex('orders').insert([
    {
      created_at: new Date('2025-10-20T10:30:00Z'),
      loyalty_member_id: lm1,
      subtotal: 25.50,
      points_used: 5,
      total_amount: 20.50,
    },
    {
      created_at: new Date('2025-10-21T14:00:00Z'),
      loyalty_member_id: null,
      subtotal: 13.49,
      points_used: 0,
      total_amount: 13.49,
    },
    {
      created_at: new Date('2025-10-22T09:15:00Z'),
      loyalty_member_id: lm2,
      subtotal: 15.00,
      points_used: 0,
      total_amount: 15.00,
    }
  ]).returning('id');

  const orderIdAt = idx => (inserted[idx]?.id ?? inserted[idx]);

  // look up some inventory item ids by name to ensure FK integrity
  const itemRows = await knex('renz_inventory')
    .whereIn('item_name', [
      'gochugang mayo tuna',
      'spicy tuna inari bomb',
      'spam fried rice',
    ])
    .select('id', 'item_name');
  const itemMap = Object.fromEntries(itemRows.map(r => [r.item_name, r.id]));

  // Guard: if any item missing, skip inserting order_items to avoid seed failures
  if (!itemMap['gochugang mayo tuna'] || !itemMap['spicy tuna inari bomb'] || !itemMap['spam fried rice']) {
    return;
  }

  // Inserts seed entries for order_items using the IDs from the orders insert
  return knex('order_items').insert([
    // Items for Order 1
    {
      order_id: orderIdAt(0),
      item_id: itemMap['gochugang mayo tuna'],
      quantity: 2,
      price_at_purchase: 9.50,
    },
    // Items for Order 2
    {
      order_id: orderIdAt(1),
      item_id: itemMap['spicy tuna inari bomb'],
      quantity: 1,
      price_at_purchase: 8.00,
    },
    {
      order_id: orderIdAt(1),
      item_id: itemMap['spam fried rice'],
      quantity: 1,
      price_at_purchase: 3.50,
    },
    // Items for Order 3
    {
      order_id: orderIdAt(2),
      item_id: itemMap['gochugang mayo tuna'],
      quantity: 1,
      price_at_purchase: 9.50,
    },
  ]);
};