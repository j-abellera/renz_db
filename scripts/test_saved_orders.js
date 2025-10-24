const db = require('../data/db-config');
const SavedOrders = require('../api/saved-orders/model');

async function testCreate() {
  try {
    console.log('Setting up test database...');
    await db.migrate.rollback();
    await db.migrate.latest();
    await db.seed.run();

    console.log('\nTesting createSavedOrder...');
    const result = await SavedOrders.createSavedOrder(
      {
        loyalty_member_id: null,
        subtotal: 25.5,
        points_used: 0,
        total_amount: 25.5
      },
      [
        { item_id: 1, quantity: 2, price_at_purchase: 9.5 },
        { item_id: 2, quantity: 1, price_at_purchase: 6.5 }
      ]
    );

    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await db.destroy();
  }
}

testCreate();
