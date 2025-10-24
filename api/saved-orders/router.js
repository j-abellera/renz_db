const express = require('express');
const SavedOrders = require('./model');
const { checkSavedOrderExists, validateNewSavedOrder, validateUpdateSavedOrder } = require('./middleware');

const router = express.Router();

// Get all saved orders (with items)
router.get('/', async (req, res, next) => {
  try {
    const savedOrders = await SavedOrders.getAllWithItems();
    res.json({ data: savedOrders });
  } catch (err) { next(err); }
});

// Get single saved order with items
router.get('/:id', checkSavedOrderExists, async (req, res, next) => {
  try {
    const savedOrder = await SavedOrders.getById(req.params.id);
    res.json({ data: savedOrder });
  } catch (err) { next(err); }
});

// Create saved order
router.post('/', validateNewSavedOrder, async (req, res, next) => {
  try {
    const { loyalty_member_id = null, subtotal, points_used = 0, total_amount, items } = req.body;
    const orderPayload = { loyalty_member_id, subtotal, points_used, total_amount };
    const created = await SavedOrders.createSavedOrder(orderPayload, items);
    res.status(201).json({ data: created });
  } catch (err) { next(err); }
});

// Update saved order (if modifications needed)
router.put('/:id', checkSavedOrderExists, validateUpdateSavedOrder, async (req, res, next) => {
  try {
    const { loyalty_member_id = null, subtotal, points_used = 0, total_amount, items } = req.body;
    const orderPayload = { loyalty_member_id, subtotal, points_used, total_amount };
    const updated = await SavedOrders.updateSavedOrder(Number(req.params.id), orderPayload, items);
    res.json({ data: updated });
  } catch (err) { next(err); }
});

// Delete saved order (cancel)
router.delete('/:id', checkSavedOrderExists, async (req, res, next) => {
  try {
    await SavedOrders.deleteSavedOrder(req.params.id);
    res.json({ message: `saved order ${req.params.id} deleted` });
  } catch (err) { next(err); }
});

// Convert saved order to finalized order
router.post('/:id/finalize', checkSavedOrderExists, async (req, res, next) => {
  try {
    const finalizedOrder = await SavedOrders.finalizeSavedOrder(Number(req.params.id));
    res.status(201).json({ 
      message: `saved order ${req.params.id} finalized`,
      data: finalizedOrder 
    });
  } catch (err) { next(err); }
});

module.exports = router;
