const db = require('../../data/db-config');

const getAll = () => db('renz_inventory');

const getById = id => db('renz_inventory').where({ id }).first();

const getByName = item_name => db('renz_inventory').where({ item_name }).first();

const addItem = async (item_name, category, count = 0, price = 0) => {
  await db('renz_inventory').insert({ item_name, category, count, price });
  return getByName(item_name);
};


const updateCount = async (item_name, delta) => {
  const item = await getByName(item_name);
  if (!item) return null;
  const newCount = item.count + delta;
  await db('renz_inventory').where({ item_name }).update({ count: newCount });
  return getByName(item_name);
};

const updatePrice = async (item_name, price) => {
  await db('renz_inventory').where({ item_name }).update({ price });
  return getByName(item_name);
};

const removeItem = async (item_name) => {
  return db('renz_inventory').where({ item_name }).del();
};

module.exports = {
  getAll,
  getById,
  getByName,
  addItem,
  updateCount,
  updatePrice,
  removeItem,
};
