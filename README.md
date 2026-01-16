# Product Listing Backend

Backend for the Product Listing Web App — Express + TypeScript + MongoDB (Mongoose).

This README documents what is implemented, how to run locally, how to deploy (Render), and quick API test commands (including Swagger).

---

## Summary

Implemented backend features:
- User authentication with JWT (register & login).
- Product listing and CRUD (search, category filter, price range, pagination).
- Persistent per-user cart (add / update / remove items) and checkout that creates orders.
- Order item management (remove or decrement items inside an order).
- OpenAPI/Swagger UI available at `/api/docs`.
- Deployment-ready: `render.yaml` + Dockerfile and CI artifacts included.

Notes on order flow: orders are created via cart checkout (`POST /api/cart/checkout`). The separate create/list/delete order endpoints were intentionally removed to avoid duplication with the cart flow. The API keeps an item-level order modification route so users can remove or decrement items in an existing order.

---

## Quick start (local)

1. Copy `.env.example` to `.env` and set values (do NOT commit `.env`):

```bash
cp .env.example .env
# Edit .env -> set MONGODB_URI (mongodb://localhost:27017/product-listing for local), JWT_SECRET, PORT (optional)
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Seed the DB with an admin user and sample products:

```bash
npm run seed
```

4. Run in development (with hot reload):

```bash
npm run dev
```

Or build and run the production build:

```bash
npm run build
npm start
```

The server defaults to `http://localhost:4000` unless `PORT` is set.

---

## Seeded credentials (for quick testing)

- username: `admin`
- password: `password`

(Seed creates example products and an `admin` user.)

---

## API (high level)

Authentication
- POST `/api/auth/register` - register (username, password)
- POST `/api/auth/login` - login (username, password) → { token }

Products
- GET `/api/products` - list products (supports `q`, `category`, `minPrice`, `maxPrice`, `page`, `limit`)
- GET `/api/products/:id` - product detail
- POST `/api/products` - create product (requires Authorization: Bearer <token>)
- PUT `/api/products/:id` - update product (requires auth)
- DELETE `/api/products/:id` - delete product (requires auth)

Cart (persistent on User)
- GET `/api/cart` - get current user's cart (populated product objects)
- POST `/api/cart` - add/increment item in cart (body: { product, quantity })
- PUT `/api/cart` - update item quantity in cart (body: { product, quantity })
- DELETE `/api/cart/:productId` - remove a product from cart
- POST `/api/cart/checkout` - create an order from the cart and clear the cart

Order item management
- DELETE `/api/orders/:orderId/items/:productId` - remove or decrement items inside an order (owner only). Optional query/body `quantity` to decrement; omit to remove the item entirely.

API docs (Swagger)
- Interactive docs available at: `GET /api/docs`

---

## Quick test commands (replace placeholders)

Replace `<URL>` with your server base (e.g. `http://localhost:4000` or your Render URL), `<TOKEN>` with the JWT returned by login, and `<PRODUCT_ID>` / `<ORDER_ID>` with the real ids.

Register (example):

```bash
curl -i -X POST "<URL>/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"P@ssword1!"}'
```

Login (get token):

```bash
curl -s -X POST "<URL>/api/auth/login" -H "Content-Type: application/json" -d '{"username":"admin","password":"password"}' | jq
```

List products (example):

```bash
curl "<URL>/api/products?q=shirt&category=Clothing&minPrice=10&maxPrice=100&page=1&limit=10"
```

Add to cart:

```bash
curl -i -X POST "<URL>/api/cart" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"product":"<PRODUCT_ID>","quantity":2}'
```

View cart:

```bash
curl -i -X GET "<URL>/api/cart" -H "Authorization: Bearer <TOKEN>"
```

Checkout (create order from cart):

```bash
curl -i -X POST "<URL>/api/cart/checkout" -H "Authorization: Bearer <TOKEN>"
```

Remove N units from an order item:

```bash
curl -i -X DELETE "<URL>/api/orders/<ORDER_ID>/items/<PRODUCT_ID>?quantity=1" -H "Authorization: Bearer <TOKEN>"
```

Remove entire item from an order (no quantity):

```bash
curl -i -X DELETE "<URL>/api/orders/<ORDER_ID>/items/<PRODUCT_ID>" -H "Authorization: Bearer <TOKEN>"
```

Swagger UI for interactive testing:

```
<URL>/api/docs
```

---

## Deployment (Render )

This repo includes a `render.yaml` to help declarative setup. Quick UI steps:
1. Push the repo to GitHub (branch `main`).
2. In Render, create a new Web Service and connect the repo & `main` branch.
3. Build command: `npm ci && npm run build`; Start command: `npm start`.
4. Set environment variables in the Render service dashboard:
   - `MONGODB_URI` (Atlas recommended)
   - `JWT_SECRET` (strong random secret)
5. Trigger a deploy (or push to `main` to auto-deploy).
6. Visit `<your-render-url>/api/docs` to test.

Security notes
- Do not commit `.env` or secrets. If any credentials were accidentally pushed, rotate them immediately (Atlas DB users, JWT secret).
- Store production secrets in Render's environment variable settings (not in source).

---
