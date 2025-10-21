const db = require('../../data/db-config');

// Middleware to check if item exists
const checkItemExists = async (req, res, next) => {
  const { item_name } = req.body;
  const item = await db('renz_inventory').where({ item_name }).first();
  if (!item) {
    return res.status(404).json({ message: 'Item does not exist in inventory.' });
  }
  req.item = item;
  next();
};

// Middleware to prevent negative inventory
const preventNegativeInventory = async (req, res, next) => {
  const { item_name, delta } = req.body;
  const item = await db('renz_inventory').where({ item_name }).first();
  if (item && typeof delta === 'number' && item.count + delta < 0) {
    return res.status(400).json({ message: 'Inventory cannot go negative.' });
  }
  next();
};

// Middleware to prevent duplicate item names
const preventDuplicateItem = async (req, res, next) => {
  const { item_name } = req.body;
  const item = await db('renz_inventory').where({ item_name }).first();
  if (item) {
    return res.status(400).json({ message: 'Item name already exists.' });
  }
  next();
};

module.exports = {
  checkItemExists,
  preventNegativeInventory,
  preventDuplicateItem,
};
