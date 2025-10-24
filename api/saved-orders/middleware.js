const db = require('../../data/db-config');

async function checkSavedOrderExists(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'invalid saved order id' });
  const exists = await db('saved_orders').where({ id }).first();
  if (!exists) return res.status(404).json({ message: 'saved order not found' });
  next();
}

function validateNewSavedOrder(req, res, next) {
  const { subtotal, total_amount, points_used, loyalty_member_id, items } = req.body;
  // Required monetary fields
  if (subtotal === undefined || total_amount === undefined) {
    return res.status(400).json({ message: 'subtotal and total_amount are required' });
  }
  // Items required and must be non-empty array
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items array is required' });
  }
  // Validate items
  for (const [idx, it] of items.entries()) {
    if (it.item_id === undefined || it.quantity === undefined || it.price_at_purchase === undefined) {
      return res.status(400).json({ message: `items[${idx}] must include item_id, quantity, price_at_purchase` });
    }
    if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
      return res.status(400).json({ message: `items[${idx}].quantity must be a positive integer` });
    }
  }
  // Optional fields normalization
  if (points_used === undefined) req.body.points_used = 0;
  if (loyalty_member_id === '') req.body.loyalty_member_id = null;
  next();
}

function validateUpdateSavedOrder(req, res, next) {
  const { subtotal, total_amount, points_used, loyalty_member_id, items } = req.body;
  // Required monetary fields
  if (subtotal === undefined || total_amount === undefined) {
    return res.status(400).json({ message: 'subtotal and total_amount are required' });
  }
  // Items required and must be non-empty array
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items array is required' });
  }
  // Validate items
  for (const [idx, it] of items.entries()) {
    if (it.item_id === undefined || it.quantity === undefined || it.price_at_purchase === undefined) {
      return res.status(400).json({ message: `items[${idx}] must include item_id, quantity, price_at_purchase` });
    }
    if (!Number.isInteger(it.quantity) || it.quantity <= 0) {
      return res.status(400).json({ message: `items[${idx}].quantity must be a positive integer` });
    }
  }
  // Optional fields normalization
  if (points_used === undefined) req.body.points_used = 0;
  if (loyalty_member_id === '') req.body.loyalty_member_id = null;
  next();
}

module.exports = {
  checkSavedOrderExists,
  validateNewSavedOrder,
  validateUpdateSavedOrder,
};
