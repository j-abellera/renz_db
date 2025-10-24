const request = require('supertest');
const server = require('../api/server');
const db = require('../data/db-config');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

describe('Saved Orders API', () => {
  let savedOrderId;

  describe('POST /api/saved-orders - Create saved order', () => {
    it('should create a new saved order with items', async () => {
      const res = await request(server)
        .post('/api/saved-orders')
        .send({
          loyalty_member_id: null,
          subtotal: 25.5,
          points_used: 0,
          total_amount: 25.5,
          items: [
            { item_id: 1, quantity: 2, price_at_purchase: 9.5 },
            { item_id: 2, quantity: 1, price_at_purchase: 6.5 }
          ]
        });

      if (res.status !== 201) {
        console.log('Response body:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.subtotal).toBe('25.50');
      expect(res.body.data.items).toHaveLength(2);
      savedOrderId = res.body.data.id;
    });

    it('should reject saved order without items', async () => {
      const res = await request(server)
        .post('/api/saved-orders')
        .send({
          subtotal: 10,
          total_amount: 10,
          items: []
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/items array is required/);
    });

    it('should reject saved order with invalid item data', async () => {
      const res = await request(server)
        .post('/api/saved-orders')
        .send({
          subtotal: 10,
          total_amount: 10,
          items: [{ item_id: 1, quantity: 2 }] // missing price_at_purchase
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/price_at_purchase/);
    });
  });

  describe('GET /api/saved-orders - Get all saved orders', () => {
    it('should return all saved orders with items', async () => {
      const res = await request(server).get('/api/saved-orders');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('items');
    });
  });

  describe('GET /api/saved-orders/:id - Get single saved order', () => {
    it('should return a single saved order with items', async () => {
      const res = await request(server).get(`/api/saved-orders/${savedOrderId}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', savedOrderId);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data.items).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent saved order', async () => {
      const res = await request(server).get('/api/saved-orders/99999');

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/saved order not found/);
    });
  });

  describe('PUT /api/saved-orders/:id - Update saved order', () => {
    it('should update a saved order', async () => {
      const res = await request(server)
        .put(`/api/saved-orders/${savedOrderId}`)
        .send({
          loyalty_member_id: null,
          subtotal: 30,
          points_used: 0,
          total_amount: 30,
          items: [
            { item_id: 1, quantity: 3, price_at_purchase: 10 }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.subtotal).toBe('30.00');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].quantity).toBe(3);
    });

    it('should return 404 when updating non-existent saved order', async () => {
      const res = await request(server)
        .put('/api/saved-orders/99999')
        .send({
          subtotal: 20,
          total_amount: 20,
          items: [{ item_id: 1, quantity: 1, price_at_purchase: 20 }]
        });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/saved-orders/:id/finalize - Finalize saved order', () => {
    it('should convert saved order to finalized order', async () => {
      // Create a new saved order to finalize
      const createRes = await request(server)
        .post('/api/saved-orders')
        .send({
          loyalty_member_id: null,
          subtotal: 15,
          points_used: 0,
          total_amount: 15,
          items: [
            { item_id: 1, quantity: 1, price_at_purchase: 15 }
          ]
        });

      const newSavedOrderId = createRes.body.data.id;

      // Finalize it
      const finalizeRes = await request(server)
        .post(`/api/saved-orders/${newSavedOrderId}/finalize`);

      expect(finalizeRes.status).toBe(201);
      expect(finalizeRes.body.message).toMatch(/finalized/);
      expect(finalizeRes.body.data).toHaveProperty('id');
      expect(finalizeRes.body.data.subtotal).toBe('15.00');

      // Verify saved order is deleted
      const checkRes = await request(server).get(`/api/saved-orders/${newSavedOrderId}`);
      expect(checkRes.status).toBe(404);

      // Verify finalized order exists in orders table
      const orderRes = await request(server).get(`/api/orders/${finalizeRes.body.data.id}`);
      expect(orderRes.status).toBe(200);
      expect(orderRes.body.data.subtotal).toBe('15.00');
    });

    it('should return 404 when finalizing non-existent saved order', async () => {
      const res = await request(server).post('/api/saved-orders/99999/finalize');

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/saved-orders/:id - Delete saved order', () => {
    it('should delete a saved order', async () => {
      const res = await request(server).delete(`/api/saved-orders/${savedOrderId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/);

      // Verify it's gone
      const checkRes = await request(server).get(`/api/saved-orders/${savedOrderId}`);
      expect(checkRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent saved order', async () => {
      const res = await request(server).delete('/api/saved-orders/99999');

      expect(res.status).toBe(404);
    });
  });
});
