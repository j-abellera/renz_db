# Orders API - Response Examples

## GET /api/orders

Returns all orders with their items in a single request.

### Before (required N+1 requests)
```javascript
// Frontend had to make multiple requests:
// 1. GET /api/orders -> get order list
// 2. GET /api/orders/1 -> get items for order 1
// 3. GET /api/orders/2 -> get items for order 2
// ... etc
```

### After (single request)
```json
{
  "data": [
    {
      "id": 1,
      "created_at": "2025-10-20T10:30:00.000Z",
      "loyalty_member_id": 1,
      "subtotal": "25.50",
      "points_used": 5,
      "total_amount": "20.50",
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "item_id": 81,
          "item_name": "gochugang mayo tuna",
          "quantity": 2,
          "price_at_purchase": "9.50"
        }
      ]
    },
    {
      "id": 2,
      "created_at": "2025-10-21T14:00:00.000Z",
      "loyalty_member_id": null,
      "subtotal": "13.49",
      "points_used": 0,
      "total_amount": "13.49",
      "items": [
        {
          "id": 2,
          "order_id": 2,
          "item_id": 85,
          "item_name": "spicy tuna inari bomb",
          "quantity": 1,
          "price_at_purchase": "8.00"
        },
        {
          "id": 3,
          "order_id": 2,
          "item_id": 86,
          "item_name": "spam fried rice",
          "quantity": 1,
          "price_at_purchase": "3.50"
        }
      ]
    }
  ]
}
```

## Performance Benefits

- **Before**: N+1 queries (1 for orders list + 1 per order for items)
  - 100 orders = 101 HTTP requests from frontend
  
- **After**: Single request with 2 optimized database queries
  - 100 orders = 1 HTTP request from frontend
  - Query 1: Fetch all orders
  - Query 2: Fetch all items for those orders (single JOIN query)
  - Items are grouped in JavaScript and attached to each order

## GET /api/orders/:id

Single order endpoint remains unchanged - still returns order with items:

```json
{
  "data": {
    "id": 1,
    "created_at": "2025-10-20T10:30:00.000Z",
    "loyalty_member_id": 1,
    "subtotal": "25.50",
    "points_used": 5,
    "total_amount": "20.50",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "item_id": 81,
        "quantity": 2,
        "price_at_purchase": "9.50"
      }
    ]
  }
}
```
