const express = require('express');
const Inventory = require('./model');
const {
  checkItemExists,
  preventNegativeInventory,
  preventDuplicateItem,
} = require('./middleware');

const router = express.Router();

// Get all inventory items
router.get('/', async (req, res) => {
  const items = await Inventory.getAll();
  res.json(items);
});

// Add a new inventory item
router.post('/add', preventDuplicateItem, async (req, res) => {
  const { item_name, category, count = 0 } = req.body;
  if (!item_name) return res.status(400).json({ message: 'item_name required' });
  if (!category) return res.status(400).json({ message: 'category required' });
  const item = await Inventory.addItem(item_name, category, count);
  res.status(201).json(item);
});

// Add to inventory count
router.put('/add', checkItemExists, async (req, res) => {
  const { item_name, delta } = req.body;
  if (typeof delta !== 'number' || delta <= 0) {
    return res.status(400).json({ message: 'delta must be a positive number' });
  }
  const updated = await Inventory.updateCount(item_name, delta);
  res.json(updated);
});

// Subtract from inventory count
router.put('/subtract', checkItemExists, preventNegativeInventory, async (req, res) => {
  const { item_name, delta } = req.body;
  if (typeof delta !== 'number' || delta <= 0) {
    return res.status(400).json({ message: 'delta must be a positive number' });
  }
  const updated = await Inventory.updateCount(item_name, -delta);
  res.json(updated);
});


// Remove an inventory item
router.delete('/remove', checkItemExists, async (req, res) => {
  const { item_name } = req.body;
  await Inventory.removeItem(item_name);
  res.json({ message: `Item '${item_name}' removed from inventory.` });
});

module.exports = router;
