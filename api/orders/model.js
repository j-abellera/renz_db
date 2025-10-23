const db = require('../../data/db-config');

// Helper: shape orders with items from flat join rows
function groupOrder(rows) {
	if (!rows || rows.length === 0) return null;
	const base = {
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
			base.items.push({
				id: r.order_item_id,
				order_id: r.id,
				item_id: r.item_id,
				quantity: r.quantity,
				price_at_purchase: r.price_at_purchase,
			});
		}
	});
	return base;
}

async function getAll() {
	// Return orders without items to keep list light
	return db('orders').select('*').orderBy('created_at', 'desc');
}

async function getById(id) {
	const rows = await db('orders as o')
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
		.where('o.id', id)
		.orderBy('oi.id', 'asc');
	return groupOrder(rows);
}

async function createOrder(order, items = []) {
	return db.transaction(async trx => {
		const [inserted] = await trx('orders')
			.insert(order)
			.returning('*');

		const orderRow = Array.isArray(inserted) ? inserted[0] : inserted;
		const order_id = orderRow.id;

		if (items.length > 0) {
			const payload = items.map(i => ({
				order_id,
				item_id: i.item_id,
				quantity: i.quantity,
				price_at_purchase: i.price_at_purchase,
			}));
			await trx('order_items').insert(payload);
		}

		return getById(order_id);
	});
}

async function deleteOrder(id) {
	return db('orders').where({ id }).del();
}

async function addItems(order_id, items = []) {
	if (!items.length) return getById(order_id);
	await db('order_items').insert(
		items.map(i => ({
			order_id,
			item_id: i.item_id,
			quantity: i.quantity,
			price_at_purchase: i.price_at_purchase,
		}))
	);
	return getById(order_id);
}

module.exports = {
	getAll,
	getById,
	createOrder,
	deleteOrder,
	addItems,
};

