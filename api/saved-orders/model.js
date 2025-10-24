const db = require('../../data/db-config');

// Helper: shape saved orders with items from flat join rows
function groupSavedOrder(rows) {
	if (!rows || rows.length === 0) return null;
	const base = {
		id: rows[0].id,
		created_at: rows[0].created_at,
		updated_at: rows[0].updated_at,
		loyalty_member_id: rows[0].loyalty_member_id,
		subtotal: rows[0].subtotal,
		points_used: rows[0].points_used,
		total_amount: rows[0].total_amount,
		items: [],
	};
	rows.forEach(r => {
		if (r.saved_order_item_id) {
			base.items.push({
				id: r.saved_order_item_id,
				saved_order_id: r.id,
				item_id: r.item_id,
				quantity: r.quantity,
				price_at_purchase: r.price_at_purchase,
			});
		}
	});
	return base;
}

async function getAll() {
	// Return saved orders without items to keep list light
	return db('saved_orders').select('*').orderBy('created_at', 'desc');
}

async function getAllWithItems() {
	// Fetch all saved orders
	const savedOrders = await db('saved_orders').select('*').orderBy('created_at', 'desc');
	
	if (savedOrders.length === 0) return [];
	
	// Fetch all items for those orders in one query
	const savedOrderIds = savedOrders.map(o => o.id);
	const items = await db('saved_order_items')
		.select(
			'saved_order_items.id',
			'saved_order_items.saved_order_id',
			'saved_order_items.item_id',
			'saved_order_items.quantity',
			'saved_order_items.price_at_purchase',
			'renz_inventory.item_name'
		)
		.whereIn('saved_order_items.saved_order_id', savedOrderIds)
		.leftJoin('renz_inventory', 'saved_order_items.item_id', 'renz_inventory.id')
		.orderBy('saved_order_items.id', 'asc');
	
	// Group items by saved_order_id
	const itemsBySavedOrder = items.reduce((acc, item) => {
		if (!acc[item.saved_order_id]) acc[item.saved_order_id] = [];
		acc[item.saved_order_id].push({
			id: item.id,
			saved_order_id: item.saved_order_id,
			item_id: item.item_id,
			item_name: item.item_name,
			quantity: item.quantity,
			price_at_purchase: item.price_at_purchase,
		});
		return acc;
	}, {});
	
	// Attach items to each saved order
	return savedOrders.map(order => ({
		...order,
		items: itemsBySavedOrder[order.id] || [],
	}));
}

async function getById(id) {
	const rows = await db('saved_orders as so')
		.leftJoin('saved_order_items as soi', 'so.id', 'soi.saved_order_id')
		.select(
			'so.id',
			'so.created_at',
			'so.updated_at',
			'so.loyalty_member_id',
			'so.subtotal',
			'so.points_used',
			'so.total_amount',
			'soi.id as saved_order_item_id',
			'soi.item_id',
			'soi.quantity',
			'soi.price_at_purchase'
		)
		.where('so.id', id)
		.orderBy('soi.id', 'asc');
	return groupSavedOrder(rows);
}

async function createSavedOrder(order, items = []) {
	const saved_order_id = await db.transaction(async trx => {
		const [inserted] = await trx('saved_orders')
			.insert(order)
			.returning('*');

		const orderRow = Array.isArray(inserted) ? inserted[0] : inserted;
		const id = orderRow.id;

		if (items.length > 0) {
			const payload = items.map(i => ({
				saved_order_id: id,
				item_id: i.item_id,
				quantity: i.quantity,
				price_at_purchase: i.price_at_purchase,
			}));
			await trx('saved_order_items').insert(payload);
		}

		return id;
	});

	return getById(saved_order_id);
}

async function updateSavedOrder(id, order, items = []) {
	await db.transaction(async trx => {
		// Update the saved order with updated_at timestamp
		await trx('saved_orders')
			.where({ id })
			.update({
				...order,
				updated_at: trx.fn.now()
			});

		// Delete existing items
		await trx('saved_order_items').where({ saved_order_id: id }).del();

		// Insert new items
		if (items.length > 0) {
			const payload = items.map(i => ({
				saved_order_id: id,
				item_id: i.item_id,
				quantity: i.quantity,
				price_at_purchase: i.price_at_purchase,
			}));
			await trx('saved_order_items').insert(payload);
		}
	});

	return getById(id);
}

async function deleteSavedOrder(id) {
	return db('saved_orders').where({ id }).del();
}

async function finalizeSavedOrder(id) {
	return db.transaction(async trx => {
		// Get the saved order with items
		const savedOrder = await getById(id);
		
		if (!savedOrder) {
			throw new Error('Saved order not found');
		}

		// Create the finalized order
		const [insertedOrder] = await trx('orders')
			.insert({
				loyalty_member_id: savedOrder.loyalty_member_id,
				subtotal: savedOrder.subtotal,
				points_used: savedOrder.points_used,
				total_amount: savedOrder.total_amount,
			})
			.returning('*');

		const orderRow = Array.isArray(insertedOrder) ? insertedOrder[0] : insertedOrder;
		const order_id = orderRow.id;

		// Copy items to order_items
		if (savedOrder.items.length > 0) {
			const payload = savedOrder.items.map(i => ({
				order_id,
				item_id: i.item_id,
				quantity: i.quantity,
				price_at_purchase: i.price_at_purchase,
			}));
			await trx('order_items').insert(payload);
		}

		// Delete the saved order (cascade will delete items)
		await trx('saved_orders').where({ id }).del();

		// Return the finalized order with items
		const rows = await trx('orders as o')
			.leftJoin('order_items as oi', 'o.id', 'oi.order_id')
			.select(
				'o.id',
				'o.created_at',
				'o.loyalty_member_id',
				'o.subtotal',
				'o.points_used',
				'o.total_amount',
				'oi.id as order_item_id',
				'oi.item_id',
				'oi.quantity',
				'oi.price_at_purchase'
			)
			.where('o.id', order_id)
			.orderBy('oi.id', 'asc');

		// Use similar grouping logic as orders
		if (!rows || rows.length === 0) return null;
		const finalOrder = {
			id: rows[0].id,
			created_at: rows[0].created_at,
			loyalty_member_id: rows[0].loyalty_member_id,
			subtotal: rows[0].subtotal,
			points_used: rows[0].points_used,
			total_amount: rows[0].total_amount,
			items: [],
		};
		rows.forEach(r => {
			if (r.order_item_id) {
				finalOrder.items.push({
					id: r.order_item_id,
					order_id: r.id,
					item_id: r.item_id,
					quantity: r.quantity,
					price_at_purchase: r.price_at_purchase,
				});
			}
		});

		return finalOrder;
	});
}

module.exports = {
	getAll,
	getAllWithItems,
	getById,
	createSavedOrder,
	updateSavedOrder,
	deleteSavedOrder,
	finalizeSavedOrder,
};
