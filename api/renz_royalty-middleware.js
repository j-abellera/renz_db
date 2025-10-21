const DB = require('./renz_royalty-model');

const checkCustomerExists = async (req, res, next) => {
  try {
    const { id, phone } = req.params;
    let customer;

    if (id) {
      customer = await DB.getCustomerById(id);
    } else if (phone) {
      customer = await DB.getCustomerByPhone(phone);
    } else {
      const err = new Error('Missing customer identifier: provide either id or phone');
      err.status = 400;
      throw err;
    }

    if (!customer) {
      const err = new Error(`Customer not found using ${id ? `id ${id}` : `phone number ${phone}`}`);
      err.status = 404;
      throw err;
    }

    req.customer = customer;
    next();
  } catch (err) {
    next(err);
  }
};


const checkCustomerSchema = async (req, res, next) => {
    try {
        const { name, phone_number } = req.body;
        if (!name || !phone_number) {
            const err = new Error('Missing required fields: name, phone_number');
            err.status = 400;
            return next(err);
        }
        const customer  = await DB.getCustomerByPhone(phone_number);
        if (customer) {
            const err = new Error(`Customer with phone number ${phone_number} already exists`);
            err.status = 409;
            return next(err);
        }
        next();
    } catch (err) {
        return next(err);
    }
};


    module.exports = {
        checkCustomerExists,
        checkCustomerSchema,
    };