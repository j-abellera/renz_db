const db = require('../data/db-config');

const getAllCustomers = () => {
  return db('renz_loyalty');
};

const getCustomerByPhone = (phone) => {
  return db('renz_loyalty').where({ "phone_number": phone }).first();
};

const addCustomer = async (customer) => {
  const [phone_number] = await db('renz_loyalty').insert(customer);
  return getCustomerByPhone(phone_number);
};

const updateCustomerPoints = async (id, points) => {
  await db('renz_loyalty').where({ id }).update({ points, updated_at: db.fn.now() });
  return getCustomerById(id);
};

module.exports = {
  getAllCustomers,
  getCustomerByPhone,
  addCustomer,
  updateCustomerPoints,
};