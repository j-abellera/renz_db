const db = require('../../data/db-config');

const getAll = () => db('renz_inventory');

const getById = id => db('renz_inventory').where({ id }).first();

const getByName = item_name => db('renz_inventory').where({ item_name }).first();

const addItem = async (item_name, count = 0) => {
  const [id] = await db('renz_inventory').insert({ item_name, count });
  return getById(id);
};

const updateCount = async (item_name, delta) => {
  const item = await getByName(item_name);
  if (!item) return null;
  const newCount = item.count + delta;
  await db('renz_inventory').where({ item_name }).update({ count: newCount });
  return getByName(item_name);
};

module.exports = {
  getAll,
  getById,
  getByName,
  addItem,
  updateCount,
};
