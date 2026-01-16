# Product Listing Backend

This repository contains the backend for the Product Listing Web App (Express + TypeScript + MongoDB).

Features implemented:
- User authentication (register/login) with JWT
- Product CRUD (create, read, update, delete)
- Product listing with search, category filter, price range, pagination
- Orders collection and simple order creation (cart persistence per user)
- Seed script to create initial user and products

Quick start

1. Copy `.env.example` to `.env` and set values (MONGODB_URI, JWT_SECRET, PORT)

2. Install dependencies:

```bash
npm install
```

3. Run seed to create example data (optional):

```bash
npm run seed
```

4. Start in development:

```bash
npm run dev
```

Or build and run:

```bash
npm run build
npm start
```

API Endpoints

- POST /api/auth/register - register (username, password)
- POST /api/auth/login - login (username, password) -> { token }
- GET /api/products - list products with filters
- GET /api/products/:id - product detail
- POST /api/products - create product (requires Authorization: Bearer <token>)
- PUT /api/products/:id - update product (requires auth)
- DELETE /api/products/:id - delete product (requires auth)
- POST /api/orders - create order for authenticated user
- GET /api/orders - list orders for authenticated user

Deployment

- For Heroku: set config vars (MONGODB_URI, JWT_SECRET, PORT). Push the repo, Heroku will run `npm start`.
- For Docker: build and run the provided Dockerfile.

## Quick Deploy (Heroku) — recommended for interview testing

This repository includes a GitHub Actions workflow that will build and deploy to Heroku whenever you push to `main`.

Manual Heroku deploy (fast):

1. Create a Heroku app:

```bash
heroku create <app-name>
```

2. Set required config vars on Heroku (replace values):

```bash
heroku config:set MONGODB_URI="<your_mongo_uri>" JWT_SECRET="<long-random-secret>" --app <app-name>
```

3. Push your repository to Heroku (if using git):

```bash
git push heroku main
```

CI deploy using GitHub Actions (recommended):

1. In your GitHub repository settings, add repository secrets:
   - `HEROKU_API_KEY` — your Heroku API key (from Account Settings -> API Key).
   - `HEROKU_APP_NAME` — the app name you created on Heroku.
   - `HEROKU_EMAIL` — your Heroku account email.

2. Push to `main`. The CI will run `npm ci`, `npm run build`, and deploy to Heroku automatically.

Notes:
- Ensure `MONGODB_URI` points to a reachable MongoDB (Atlas is recommended). For Heroku, set it in the app config as shown above.
- Keep your `JWT_SECRET` secret. Use a long random value (48+ bytes hex) and store it in Heroku config vars.

Notes

This backend is intentionally self-contained and easy to integrate with any frontend. JWT tokens are returned on login and should be sent in Authorization headers as "Bearer <token>".
