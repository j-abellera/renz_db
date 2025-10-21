const db = require('../../data/db-config');

const getAllCustomers = () => {
  return db('renz_loyalty');
};

const getCustomerByPhone = (phone) => {
  return db('renz_loyalty').where({ "phone_number": phone }).first();
};

const getCustomerById = (id) => {
  return db('renz_loyalty').where({ id }).first();
};

const addCustomer = async (customer) => {
  const response = await db('renz_loyalty').insert(customer).returning('*');
  return getCustomerByPhone(response[0].phone_number);
};

const updateCustomerPoints = async (id, points) => {
  const customer = await db('renz_loyalty').where({ id }).update({ points, updated_at: db.fn.now() }).returning('*');
  console.log("updated customer", customer);
  return getCustomerByPhone(customer[0].phone_number);
};

module.exports = {
  getAllCustomers,
  getCustomerByPhone,
  getCustomerById,
  addCustomer,
  updateCustomerPoints,
};
