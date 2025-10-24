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
  const showArchived = req.query.archived === 'true';
  const items = showArchived ? await Inventory.getAll() : await Inventory.getAllActive();
  res.json(items);
});

// Add a new inventory item
router.post('/add', preventDuplicateItem, async (req, res) => {
  const { item_name, category, count = 0, price = 0 } = req.body;
  if (!item_name) return res.status(400).json({ message: 'item_name required' });
  if (!category) return res.status(400).json({ message: 'category required' });
  const item = await Inventory.addItem(item_name, category, count, price);
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

// Update item price
router.put('/price', checkItemExists, async (req, res) => {
  const { item_name, price } = req.body;
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'price must be a non-negative number' });
  }
  const updated = await Inventory.updatePrice(item_name, price);
  res.json(updated);
});

// Archive an inventory item (soft delete)
router.put('/archive', checkItemExists, async (req, res) => {
  const { item_name } = req.body;
  const archived = await Inventory.archiveItem(item_name);
  res.json(archived);
});

// Unarchive an inventory item
router.put('/unarchive', checkItemExists, async (req, res) => {
  const { item_name } = req.body;
  const unarchived = await Inventory.unarchiveItem(item_name);
  res.json(unarchived);
});

// Remove an inventory item (hard delete - will fail if item has orders due to RESTRICT constraint)
router.delete('/remove', checkItemExists, async (req, res) => {
  const { item_name } = req.body;
  try {
    await Inventory.removeItem(item_name);
    res.json({ message: `Item '${item_name}' removed from inventory.` });
  } catch (err) {
    if (err.code === '23503') { // PostgreSQL foreign key violation
      return res.status(409).json({ 
        message: `Cannot delete '${item_name}' because it has associated orders. Use archive instead.` 
      });
    }
    throw err;
  }
});

module.exports = router;
