# Inventory Archive Feature - Implementation Summary

## Problem Solved

Previously, deleting an inventory item would cause issues with historical order data. The `order_items` table has a foreign key constraint with `RESTRICT`, which means:
- You **cannot delete** an inventory item if it has been ordered
- This protects historical order data from being lost

## Solution Implemented

Added a **soft delete** (archive) system to inventory:

### 1. Database Changes

**New Migration:** `20251023233907_add_is_archived_to_inventory.js`
- Added `is_archived` boolean column to `renz_inventory` table
- Defaults to `false` for all items
- Allows items to be hidden from active inventory without losing order history

### 2. Model Updates (`api/inventory/model.js`)

**New Functions:**
- `getAllActive()` - Returns only non-archived items
- `archiveItem(item_name)` - Sets `is_archived = true`
- `unarchiveItem(item_name)` - Sets `is_archived = false`

**Existing Functions:**
- `getAll()` - Still returns all items (including archived)
- `removeItem()` - Hard delete (kept for admin use, will fail if item has orders)

### 3. Router Updates (`api/inventory/router.js`)

**Modified Routes:**

**GET /api/inventory**
- Now returns only active (non-archived) items by default
- Add `?archived=true` query param to see all items including archived
- Examples:
  - `GET /api/inventory` → active items only
  - `GET /api/inventory?archived=true` → all items

**PUT /api/inventory/archive**
- Archives an item (soft delete)
- Request body: `{ "item_name": "gochugang mayo tuna" }`
- Response: Updated item with `is_archived: true`

**PUT /api/inventory/unarchive**
- Unarchives an item
- Request body: `{ "item_name": "gochugang mayo tuna" }`
- Response: Updated item with `is_archived: false`

**DELETE /api/inventory/remove**
- Hard delete (permanent removal)
- **Will fail with 409 Conflict** if item has order history
- Error message: "Cannot delete '{item_name}' because it has associated orders. Use archive instead."
- Only succeeds if item has never been ordered

## Data Protection

### Foreign Key Constraint (Already in place)
```javascript
// In order_items migration
tbl.integer('item_id')
  .references('id')
  .inTable('renz_inventory')
  .onDelete('RESTRICT')  // ✅ Prevents deletion if orders exist
```

### Order History Preservation
- ✅ Historical orders remain intact even if items are archived
- ✅ `getAllWithItems()` in orders model uses LEFT JOIN, so archived items still show in order history
- ✅ Item names are captured at purchase time in `order_items.price_at_purchase`

## Usage Examples

### Frontend Flow

**Discontinuing a menu item:**
```javascript
// Archive item (recommended - preserves history)
PUT /api/inventory/archive
{
  "item_name": "old menu item"
}

// Item no longer appears in GET /api/inventory
// But still shows in historical orders
```

**Bringing back a menu item:**
```javascript
PUT /api/inventory/unarchive
{
  "item_name": "seasonal item"
}
```

**Viewing all items (including archived):**
```javascript
GET /api/inventory?archived=true
```

**Permanent deletion (admin only, rare use case):**
```javascript
DELETE /api/inventory/remove
{
  "item_name": "never_ordered_item"
}

// ✅ Success if item has no orders
// ❌ 409 Conflict if item has been ordered
```

## Benefits

1. **Data Integrity** ✅
   - Historical order data is always preserved
   - Revenue tracking remains accurate
   - Audit trail maintained

2. **Flexibility** ✅
   - Can hide discontinued items from active menu
   - Can restore items later (seasonal items, special promotions)
   - Still allows hard delete for items that were never ordered

3. **User Experience** ✅
   - Default GET returns only current menu items
   - Optional parameter to view archived items for admin/reports
   - Clear error messages when trying to delete items with order history

## Migration Status

✅ Migration applied successfully
✅ All tests passing (19/19)
✅ Ready for production use
