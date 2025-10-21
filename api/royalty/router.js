const express = require('express');
const DB = require('./model');
const router = express.Router();
const { checkCustomerExists, checkCustomerSchema } = require('./middleware');

router.get('/', async (req, res, next) => {
    try {
        const customers = await DB.getAllCustomers();
        res.status(200).json({ message: 'Customers retrieved', data: customers });
    } catch (err) {
        next(err);
    }
});

router.get('/:phone', checkCustomerExists, async (req, res, next) => {
    try {
        const { customer } = req;
        res.status(200).json({ message: 'Customer retrieved', data: customer });
    } catch (err) {
        next(err);
    }
});

router.post('/newcustomer', checkCustomerSchema, async (req, res, next) => {
    try {
        const customerData = req.body;
        const newCustomer = await DB.addCustomer(customerData);
        console.log("added customer", newCustomer);
        res.status(201).json({ message: 'New customer added', data: newCustomer });
    } catch (err) {
        next(err);
    }
});

router.post('/:id/update', checkCustomerExists, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { points, method } = req.body;

        if (method === 'add') {
            const newPoints = req.customer.points + Number(points);
            const updatedCustomer = await DB.updateCustomerPoints(id, newPoints);
            res.status(200).json({ message: 'Points added', data: updatedCustomer });
        } else if (method === 'subtract') {
            const newPoints = req.customer.points - Number(points);
            if (newPoints < 0) {
                const err = new Error('Insufficient points to subtract');
                err.status = 400;
                throw err;
            } else {
                const updatedCustomer = await DB.updateCustomerPoints(id, newPoints);
                res.status(200).json({ message: 'Points subtracted', data: updatedCustomer });
            }
        }
    } catch (err) {
        next(err);
    }
});

router.use((err, req, res, next) => {
    if (err) {
        return res
            .status(err.status || 500)
            .json({
                message: err.message || `An error has  occured while making a ${req.method} to ${req.url}`
            }
            );
    }
});

module.exports = router;
