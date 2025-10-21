const request = require('supertest');
const server = require('../api/server');
const db = require('../data/db-config');

describe('Royalty API', () => {
  beforeAll(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  // Test: Get all customers
  describe('GET /api/renz-loyalty', () => {
    it('should return all customers', async () => {
      // Get all customers
      const res = await request(server).get('/api/renz-loyalty');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // Test: Get customer by phone
  describe('GET /api/renz-loyalty/:phone', () => {
    it('should return a customer by phone', async () => {
      // Add a customer first
      await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'Test User', phone_number: '1234567890' });
      // Get by phone
      const res = await request(server).get('/api/renz-loyalty/1234567890');
      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.phone_number).toBe('1234567890');
    });
    it('should return 404 if customer not found', async () => {
      // Try to get a non-existent customer
      const res = await request(server).get('/api/renz-loyalty/0000000000');
      expect(res.status).toBe(404);
    });
  });

  // Test: Add new customer
  describe('POST /api/renz-loyalty/newcustomer', () => {
    it('should add a new customer', async () => {
      // Add a new customer
      const res = await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'Another User', phone_number: '2223334444' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Another User');
    });
    it('should not add duplicate customer', async () => {
      // Add duplicate
      await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'Dup User', phone_number: '5556667777' });
      const res = await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'Dup User', phone_number: '5556667777' });
      expect(res.status).toBe(409);
    });
    it('should require name and phone_number', async () => {
      // Missing fields
      const res = await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'No Phone' });
      expect(res.status).toBe(400);
    });
  });

  // Test: Update customer points
  describe('POST /api/renz-loyalty/:id/update', () => {
    it('should add points to a customer', async () => {
      // Add a customer
      const addRes = await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'Points User', phone_number: '8889990000' });
      const id = addRes.body.data.id;
      // Add points
      const res = await request(server)
        .post(`/api/renz-loyalty/${id}/update`)
        .send({ points: 10, method: 'add' });
      expect(res.status).toBe(200);
      expect(res.body.data.points).toBe(10);
    });
    it('should subtract points from a customer', async () => {
      // Add a customer
      const addRes = await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'Sub User', phone_number: '1112223333' });
      const id = addRes.body.data.id;
      // Add points first
      await request(server)
        .post(`/api/renz-loyalty/${id}/update`)
        .send({ points: 20, method: 'add' });
      // Subtract points
      const res = await request(server)
        .post(`/api/renz-loyalty/${id}/update`)
        .send({ points: 5, method: 'subtract' });
      expect(res.status).toBe(200);
      expect(res.body.data.points).toBe(15);
    });
    it('should not allow subtracting more points than available', async () => {
      // Add a customer
      const addRes = await request(server)
        .post('/api/renz-loyalty/newcustomer')
        .send({ name: 'No Negative', phone_number: '4445556666' });
      const id = addRes.body.data.id;
      // Try to subtract more than available
      const res = await request(server)
        .post(`/api/renz-loyalty/${id}/update`)
        .send({ points: 100, method: 'subtract' });
      expect(res.status).toBe(400);
    });
  });
});
