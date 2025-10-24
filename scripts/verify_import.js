const knex = require('../data/db-config');

async function verifyImport() {
  try {
    // Count legacy orders
    const [orderCount] = await knex('orders')
      .where('is_legacy', true)
      .count('* as count');

    // Count all order items
    const [itemCount] = await knex('order_items')
      .count('* as count');

    // Get a sample order with items
    const [sampleOrder] = await knex('orders')
      .where('is_legacy', true)
      .orderBy('created_at', 'asc')
      .limit(1);

    const items = await knex('order_items')
      .join('renz_inventory', 'order_items.item_id', 'renz_inventory.id')
      .where('order_items.order_id', sampleOrder.id)
      .select(
        'order_items.*',
        'renz_inventory.item_name'
      );

    console.log('✅ Import Verification\n');
    console.log(`📊 Total legacy orders: ${orderCount.count}`);
    console.log(`📊 Total order items: ${itemCount.count}`);
    console.log(`📊 Average items per order: ${(itemCount.count / orderCount.count).toFixed(2)}`);
    
    console.log('\n📄 Sample Order:');
    console.log(`   ID: ${sampleOrder.id}`);
    console.log(`   External ID: ${sampleOrder.external_order_id}`);
    console.log(`   Created: ${sampleOrder.created_at}`);
    console.log(`   Subtotal: $${sampleOrder.subtotal}`);
    console.log(`   Points Used: ${sampleOrder.points_used}`);
    console.log(`   Total: $${sampleOrder.total_amount}`);
    console.log(`   Is Legacy: ${sampleOrder.is_legacy}`);
    
    console.log('\n   Items:');
    items.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.item_name} x${item.quantity} @ $${item.price_at_purchase}`);
    });

    // Check date range
    const dateRange = await knex('orders')
      .where('is_legacy', true)
      .min('created_at as earliest')
      .max('created_at as latest')
      .first();

    console.log('\n📅 Date Range:');
    console.log(`   Earliest: ${dateRange.earliest}`);
    console.log(`   Latest: ${dateRange.latest}`);

    // Check for any orders with missing item references
    const missingItems = await knex('order_items')
      .leftJoin('renz_inventory', 'order_items.item_id', 'renz_inventory.id')
      .whereNull('renz_inventory.id')
      .count('* as count')
      .first();

    if (missingItems.count > 0) {
      console.log(`\n⚠️  Warning: ${missingItems.count} order items reference missing inventory items`);
    } else {
      console.log('\n✅ All order items reference valid inventory items');
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await knex.destroy();
  }
}

verifyImport();
