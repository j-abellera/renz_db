const DB = require('./renz_royalty-model');

const checkCustomerExists = async (req, res, next) => {
    try {
        const { phone } = req.params;
        const customer = await DB.getCustomerByPhone(phone);
        if (!customer) {
            const err = new Error(`Customer with phone number ${phone} not found`);
            err.status = 404;
            throw err;
        } else {
            req.customer = customer;
            return next();
        }
    } catch (err) {
        return next(err);
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