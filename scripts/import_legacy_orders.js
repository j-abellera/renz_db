const fs = require('fs');
const path = require('path');
const knex = require('../data/db-config');

const legacyDir = path.join(__dirname, '../data/legacy_data');

async function importLegacyOrders() {
  try {
    console.log('🚀 Starting legacy order import...\n');

    const files = fs.readdirSync(legacyDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    let totalOrders = 0;
    let totalItems = 0;
    let skippedOrders = 0;
    let errors = [];

    // Get all existing inventory items for mapping
    const inventoryItems = await knex('renz_inventory').select('id', 'item_name');
    const itemIdMap = {};
    inventoryItems.forEach(item => {
      itemIdMap[item.id] = item.item_name;
    });

    console.log(`📦 Found ${inventoryItems.length} inventory items in database`);
    console.log(`📁 Found ${jsonFiles.length} JSON files to import\n`);

    for (const file of jsonFiles) {
      const filePath = path.join(legacyDir, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();

      if (!content) {
        console.log(`⚠️  Skipping ${file}: empty file`);
        continue;
      }

      const orders = JSON.parse(content);
      console.log(`📄 Processing ${file}: ${orders.length} orders`);

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const externalOrderId = `${file.replace('.json', '')}_${i + 1}`;

        try {
          // Check if order already exists (idempotency)
          const existing = await knex('orders')
            .where('external_order_id', externalOrderId)
            .first();

          if (existing) {
            skippedOrders++;
            continue;
          }

          // Validate all items exist in inventory
          const missingItems = [];
          for (const item of order.items) {
            if (!itemIdMap[item.item_id]) {
              missingItems.push(item.item_id);
            }
          }

          if (missingItems.length > 0) {
            errors.push({
              file,
              order: i + 1,
              error: `Missing inventory items: ${missingItems.join(', ')}`
            });
            skippedOrders++;
            continue;
          }

          // Use transaction for each order
          await knex.transaction(async (trx) => {
            // Insert order and get the ID
            const [result] = await trx('orders')
              .insert({
                created_at: order.created_at,
                loyalty_member_id: order.loyalty_member_id,
                subtotal: order.subtotal,
                points_used: order.points_used || 0,
                total_amount: order.total_amount,
                external_order_id: externalOrderId,
                is_legacy: true
              })
              .returning('id');

            const orderId = result.id;

            // Insert order items
            const orderItems = order.items.map(item => ({
              order_id: orderId,
              item_id: item.item_id,
              quantity: item.quantity,
              price_at_purchase: item.price_at_purchase
            }));

            await trx('order_items').insert(orderItems);

            totalOrders++;
            totalItems += orderItems.length;
          });

        } catch (err) {
          errors.push({
            file,
            order: i + 1,
            error: err.message
          });
          skippedOrders++;
        }
      }
    }

    console.log('\n✅ Import completed!\n');
    console.log('📊 Summary:');
    console.log(`   ✓ Orders imported: ${totalOrders}`);
    console.log(`   ✓ Items imported: ${totalItems}`);
    if (skippedOrders > 0) {
      console.log(`   ⚠ Orders skipped: ${skippedOrders}`);
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(err => {
        console.log(`   ${err.file} - Order ${err.order}: ${err.error}`);
      });
    }

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    throw err;
  } finally {
    await knex.destroy();
  }
}

// Run the import
importLegacyOrders()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Import failed:', err);
    process.exit(1);
  });
