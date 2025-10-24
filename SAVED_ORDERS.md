# Saved Orders API

## Overview
The Saved Orders feature allows orders to be saved as drafts before finalizing them. This is useful for scenarios where:
- Orders need to be prepared in advance
- Orders might need modifications before finalizing
- You want to hold an order temporarily before committing it

## Database Structure

### Tables Created
1. **saved_orders** - Stores draft order headers
   - `id` (primary key)
   - `created_at` - When the saved order was first created
   - `updated_at` - Last modification timestamp
   - `loyalty_member_id` - Optional FK to renz_loyalty (SET NULL on delete)
   - `subtotal` - Order subtotal
   - `points_used` - Loyalty points to be used
   - `total_amount` - Final total amount

2. **saved_order_items** - Stores items in saved orders
   - `id` (primary key)
   - `saved_order_id` - FK to saved_orders (CASCADE on delete)
   - `item_id` - FK to renz_inventory (RESTRICT on delete)
   - `quantity` - Number of items
   - `price_at_purchase` - Price snapshot at time of save

## API Endpoints

### GET /api/saved-orders
Returns all saved orders with their items.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "created_at": "2025-10-24T09:00:00.000Z",
      "updated_at": "2025-10-24T09:00:00.000Z",
      "loyalty_member_id": null,
      "subtotal": "25.50",
      "points_used": 0,
      "total_amount": "25.50",
      "items": [
        {
          "id": 1,
          "saved_order_id": 1,
          "item_id": 1,
          "item_name": "gochugang mayo tuna",
          "quantity": 2,
          "price_at_purchase": "9.50"
        }
      ]
    }
  ]
}
```

### GET /api/saved-orders/:id
Returns a single saved order with items.

**Response:** Same structure as individual order above

**Error Responses:**
- 400: Invalid saved order ID
- 404: Saved order not found

### POST /api/saved-orders
Creates a new saved order.

**Request Body:**
```json
{
  "loyalty_member_id": null,
  "subtotal": 25.5,
  "points_used": 0,
  "total_amount": 25.5,
  "items": [
    {
      "item_id": 1,
      "quantity": 2,
      "price_at_purchase": 9.5
    },
    {
      "item_id": 2,
      "quantity": 1,
      "price_at_purchase": 6.5
    }
  ]
}
```

**Response:** 201 Created with saved order data

**Validation:**
- `subtotal` and `total_amount` are required
- `items` array is required and must not be empty
- Each item must have `item_id`, `quantity`, and `price_at_purchase`
- `quantity` must be a positive integer

### PUT /api/saved-orders/:id
Updates an existing saved order (replaces all items).

**Request Body:** Same as POST

**Response:** 200 OK with updated saved order data

**Notes:**
- All existing items are deleted and replaced with the new items
- The `updated_at` timestamp is automatically updated

### DELETE /api/saved-orders/:id
Deletes a saved order (cascades to items).

**Response:**
```json
{
  "message": "saved order 1 deleted"
}
```

**Error Responses:**
- 400: Invalid saved order ID
- 404: Saved order not found

### POST /api/saved-orders/:id/finalize
Converts a saved order into a finalized order.

**Process:**
1. Retrieves the saved order with all items
2. Creates a new record in the `orders` table
3. Copies all items to the `order_items` table
4. Deletes the saved order (cascade deletes items)
5. Returns the newly created finalized order

**Response:** 201 Created
```json
{
  "message": "saved order 1 finalized",
  "data": {
    "id": 100,
    "created_at": "2025-10-24T10:00:00.000Z",
    "loyalty_member_id": null,
    "subtotal": "25.50",
    "points_used": 0,
    "total_amount": "25.50",
    "items": [...]
  }
}
```

**Notes:**
- The finalized order gets a NEW `created_at` timestamp (when it was finalized, not saved)
- The finalized order appears in `/api/orders`, not `/api/saved-orders`
- This operation is atomic (uses database transaction)

**Error Responses:**
- 400: Invalid saved order ID
- 404: Saved order not found

## Files Structure

```
api/saved-orders/
├── model.js        - Database operations
├── middleware.js   - Validation and checks
└── router.js       - Route definitions

data/migrations/
└── 20251024093721_saved_orders.js  - Creates tables

tests/
└── saved-orders.test.js  - Full test suite (12 tests)
```

## Transaction Handling

All write operations use database transactions to ensure data integrity:
- **createSavedOrder**: Inserts order and items atomically
- **updateSavedOrder**: Updates order and replaces items atomically
- **finalizeSavedOrder**: Copies to orders table and deletes saved order atomically

## Foreign Key Constraints

- **saved_order_items → saved_orders**: CASCADE delete (items deleted when saved order is deleted)
- **saved_order_items → renz_inventory**: RESTRICT delete (prevents inventory deletion if referenced in saved orders)
- **saved_orders → renz_loyalty**: SET NULL on delete (keeps saved order if loyalty member is deleted)

## Testing

Run the saved-orders tests:
```bash
npm test -- saved-orders.test.js
```

**Test Coverage:**
- ✅ Create saved order with items
- ✅ Reject creation without items
- ✅ Reject creation with invalid item data
- ✅ Get all saved orders with items
- ✅ Get single saved order
- ✅ 404 for non-existent saved order
- ✅ Update saved order
- ✅ 404 when updating non-existent saved order
- ✅ Finalize saved order to orders table
- ✅ 404 when finalizing non-existent saved order
- ✅ Delete saved order
- ✅ 404 when deleting non-existent saved order

## Migration

To apply the saved_orders tables to your database:

```bash
# Development
npx knex migrate:latest --knexfile knexfile.js --env development

# Test
npx knex migrate:latest --knexfile knexfile.js --env test

# Production
npx knex migrate:latest --knexfile knexfile.js
```

## Usage Example

```javascript
// 1. Create a saved order
const savedOrder = await fetch('/api/saved-orders', {
  method: 'POST',
  body: JSON.stringify({
    subtotal: 25.50,
    total_amount: 25.50,
    items: [
      { item_id: 1, quantity: 2, price_at_purchase: 9.50 },
      { item_id: 2, quantity: 1, price_at_purchase: 6.50 }
    ]
  })
});

// 2. Update it if needed
await fetch(`/api/saved-orders/${savedOrder.data.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    subtotal: 30.00,
    total_amount: 30.00,
    items: [
      { item_id: 1, quantity: 3, price_at_purchase: 10.00 }
    ]
  })
});

// 3. Finalize when ready
const finalizedOrder = await fetch(`/api/saved-orders/${savedOrder.data.id}/finalize`, {
  method: 'POST'
});
// Now the order appears in /api/orders, not /api/saved-orders
```
