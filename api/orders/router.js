const express = require('express');
const Orders = require('./model');
const { checkOrderExists, validateNewOrder } = require('./middleware');

const router = express.Router();

// List all orders (without items for brevity)
router.get('/', async (req, res, next) => {
  try {
    const orders = await Orders.getAll();
    res.json({ data: orders });
  } catch (err) { next(err); }
});

// Get single order with items
router.get('/:id', checkOrderExists, async (req, res, next) => {
  try {
    const order = await Orders.getById(req.params.id);
    res.json({ data: order });
  } catch (err) { next(err); }
});

// Create order with items
router.post('/', validateNewOrder, async (req, res, next) => {
  try {
    const { loyalty_member_id = null, subtotal, points_used = 0, total_amount, items } = req.body;
    const orderPayload = { loyalty_member_id, subtotal, points_used, total_amount };
    const created = await Orders.createOrder(orderPayload, items);
    res.status(201).json({ data: created });
  } catch (err) { next(err); }
});

// Add items to an existing order
router.post('/:id/items', checkOrderExists, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items array is required' });
    const updated = await Orders.addItems(Number(req.params.id), items);
    res.status(201).json({ data: updated });
  } catch (err) { next(err); }
});

// Delete an order (cascades delete order_items)
router.delete('/:id', checkOrderExists, async (req, res, next) => {
  try {
    await Orders.deleteOrder(req.params.id);
    res.json({ message: `order ${req.params.id} deleted` });
  } catch (err) { next(err); }
});

module.exports = router;
