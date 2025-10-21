const express = require('express');
const server = express();
const cors = require('cors');
const renzRoyaltyRouter = require('./renz_royalty-router');

server.use(cors());
server.use(express.json());
server.use('/api/renz-loyalty', renzRoyaltyRouter);

server.use((req, res) => res.status(404).json('Page Not Found!'));

module.exports = server;