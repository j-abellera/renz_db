# RENZ Database

Database for customer loyalty information, orders list, and inventory management for RENZ.

## Tech Stack

- **Node.js** with Express
- **PostgreSQL** for all environments (development, test, production)
- **Knex.js** for database migrations and queries
- **Jest** & **Supertest** for testing

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Databases

Create the development and test databases in PostgreSQL:

```sql
CREATE DATABASE renz_loyalty_dev;
CREATE DATABASE renz_loyalty_test;
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Update the values in `.env`:

```env
# Development Database
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=renz_loyalty_dev
DEV_DB_USER=postgres
DEV_DB_PASSWORD=your_password

# Test Database
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=renz_loyalty_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_password

# Production Database
DATABASE_URL=your_production_connection_string
```

### 4. Run Migrations and Seeds

For development environment:

```bash
npm run resetdb
```

This will:
- Rollback existing migrations
- Run all migrations
- Seed the database with initial data

## Available Scripts

- `npm start` - Start the production server
- `npm run server` - Start the development server with nodemon
- `npm run resetdb` - Reset database (rollback, migrate, seed)
- `npm test` - Run tests with Jest

## Database Schema

### Tables

#### `renz_loyalty`

Customer loyalty information:
- `id` (primary key)
- `name`
- `phone_number` (unique)
- `points`
- `created_at`
- `updated_at`

#### `renz_inventory`

Inventory management:
- `id` (primary key)
- `item_name` (unique)
- `category`
- `price`
- `count`
- `is_archived` (boolean, default false)

#### `orders`

Finalized customer orders:
- `id` (primary key)
- `created_at`
- `loyalty_member_id` (foreign key to `renz_loyalty`)
- `subtotal`
- `points_used`
- `total_amount`

#### `order_items`

Line items for orders:
- `id` (primary key)
- `order_id` (foreign key to `orders`, cascades on delete)
- `item_id` (foreign key to `renz_inventory`)
- `quantity`
- `price_at_purchase`

#### `saved_orders`

Draft/pending customer orders:
- `id` (primary key)
- `created_at`
- `updated_at`
- `loyalty_member_id` (foreign key to `renz_loyalty`)
- `subtotal`
- `points_used`
- `total_amount`

#### `saved_order_items`

Line items for saved orders:
- `id` (primary key)
- `saved_order_id` (foreign key to `saved_orders`, cascades on delete)
- `item_id` (foreign key to `renz_inventory`)
- `quantity`
- `price_at_purchase`

## API Endpoints

### Loyalty API (`/api/renz-loyalty`)

- `GET /` - Get all customers
- `GET /:phone` - Get customer by phone number
- `POST /newcustomer` - Add new customer
- `POST /:id/update` - Update customer points

### Inventory API (`/api/inventory`)

- `GET /` - Get all inventory items
- `POST /add` - Add new inventory item
- `PUT /add` - Add to inventory count
- `PUT /subtract` - Subtract from inventory count
- `DELETE /remove` - Remove inventory item

### Orders API (`/api/orders`)

- `GET /` - Get all finalized orders with items
- `GET /:id` - Get single order with items by ID
- `POST /` - Create new order with items
- `POST /:id/items` - Add items to an existing order
- `DELETE /:id` - Delete an order (cascades to order items)

### Saved Orders API (`/api/saved-orders`)

- `GET /` - Get all saved orders with items
- `GET /:id` - Get single saved order with items by ID
- `POST /` - Create new saved order with items
- `PUT /:id` - Update saved order (modify order details and items)
- `DELETE /:id` - Delete a saved order (cancel)
- `POST /:id/finalize` - Convert saved order to finalized order

## Testing

Tests run in the `test` environment using a separate PostgreSQL database.

```bash
npm test
```

## Deployment

The application is configured for deployment on Vercel with PostgreSQL database connection via `DATABASE_URL` environment variable.

## License

ISC
