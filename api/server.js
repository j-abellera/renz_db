const express = require('express');
const server = express();
const cors = require('cors');
const royaltyRouter = require('./royalty/router');
const inventoryRouter = require('./inventory/router');
const ordersRouter = require('./orders/router');

server.use(cors());
server.use(express.json());
server.use('/api/renz-loyalty', royaltyRouter);
server.use('/api/inventory', inventoryRouter);
server.use('/api/orders', ordersRouter);

server.use((req, res) => res.status(404).json('Page Not Found!'));

module.exports = server;