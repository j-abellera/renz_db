const request = require('supertest');
const server = require('../api/server');
const db = require('../data/db-config');

describe('Inventory API', () => {
  beforeAll(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  // Test: Get all inventory items
  describe('GET /api/inventory', () => {
    it('should return all inventory items', async () => {
      // Get all inventory
      const res = await request(server).get('/api/inventory');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  // Test: Add new inventory item
  describe('POST /api/inventory/add', () => {
    it('should add a new inventory item', async () => {
      // Add a new item
      const res = await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'test item', count: 5, category: 'sides' });
      expect(res.status).toBe(201);
      expect(res.body.item_name).toBe('test item');
    });
    it('should not add duplicate item', async () => {
      // Try to add duplicate item
      await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'unique item', count: 1, category: 'sides' });
      const res = await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'unique item', count: 1, category: 'sides' });
      expect(res.status).toBe(400);
    });
  });

  // Test: Add to inventory count
  describe('PUT /api/inventory/add', () => {
    it('should add to inventory count', async () => {
      // Add to count
      await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'add count item', count: 1, category: 'sides' });
      const res = await request(server)
        .put('/api/inventory/add')
        .send({ item_name: 'add count item', delta: 3 });
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(4);
    });
  });

  // Test: Subtract from inventory count
  describe('PUT /api/inventory/subtract', () => {
    it('should subtract from inventory count', async () => {
      // Subtract from count
      await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'subtract count item', count: 5, category: 'sides' });
      const res = await request(server)
        .put('/api/inventory/subtract')
        .send({ item_name: 'subtract count item', delta: 2 });
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(3);
    });
    it('should not allow negative inventory', async () => {
      // Prevent negative inventory
      await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'no negative', count: 1, category: 'sides' });
      const res = await request(server)
        .put('/api/inventory/subtract')
        .send({ item_name: 'no negative', delta: 2 });
      expect(res.status).toBe(400);
    });
  });

  // Test: Remove inventory item
  describe('DELETE /api/inventory/remove', () => {
    it('should remove an inventory item', async () => {
      // Remove an item
      await request(server)
        .post('/api/inventory/add')
        .send({ item_name: 'remove me', count: 1, category: 'sides' });
      const res = await request(server)
        .delete('/api/inventory/remove')
        .send({ item_name: 'remove me' });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed/);
    });
    it('should return 404 if item does not exist', async () => {
      // Remove non-existent item
      const res = await request(server)
        .delete('/api/inventory/remove')
        .send({ item_name: 'does not exist' });
      expect(res.status).toBe(404);
    });
  });
});
