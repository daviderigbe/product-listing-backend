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

## Deploying to Render (detailed)

This section explains how to deploy the backend to Render (https://render.com). Render is fast for demo/interview apps and provides a simple UI to configure environment variables and auto-deploy from GitHub.

Prerequisites
- Push your project to a GitHub repository (branch `main`).
- Have your MongoDB Atlas URI ready.
- Generate a secure JWT secret (example below).

1) Generate a secure JWT secret (optional locally):

```bash
# generate a 48-byte hex secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

2) Commit `render.yaml` or link the repo when creating a Render service. If you commit `render.yaml` Render will read it and prefill the settings; you still need to add secrets in the Render dashboard.

3) On Render dashboard:
- Click "New" → "Web Service" → "Connect a repository" → choose the GitHub repository and branch `main`.
- If using `render.yaml`, Render will pick those settings. Otherwise fill in:
  - Environment: Node
  - Build Command: `npm ci && npm run build`
  - Start Command: `npm start`
  - Health check path: `/`
- After creating service, go to the Service → Environment tab and add the following environment variables:
  - `MONGODB_URI` = your MongoDB connection string (Atlas recommended)
  - `JWT_SECRET` = generated secret
  - (Optional) `PORT` = 4000 (Render will set $PORT automatically; leaving this empty is OK)

4) Deploy and verify
- Trigger a deploy by pushing a change to `main`, or use the Deploy button in Render.
- Once the service is live, open: `https://<your-service>.onrender.com/api/docs` to access Swagger UI and test endpoints.

Seeding
- To seed the production DB (if needed), run the seed script locally with `.env` pointing to your production `MONGODB_URI`:

```bash
cp .env.example .env
# edit .env and set MONGODB_URI to your Atlas URI and JWT_SECRET to the secret
npm run seed
```

Notes
- Keep secrets (MONGODB_URI and JWT_SECRET) in the Render dashboard; do not commit them to the repo.
- For quick demos, Render's `starter` plan is sufficient. For production, use a managed MongoDB with backups and a private network when possible.

Notes

This backend is intentionally self-contained and easy to integrate with any frontend. JWT tokens are returned on login and should be sent in Authorization headers as "Bearer <token>".
