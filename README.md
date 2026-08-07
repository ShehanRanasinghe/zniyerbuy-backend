# ⚙️ ZNIYERBUY Backend API

The central REST API for the ZNIYERBUY hyperlocal marketplace. Built with **Node.js 20 + Express 5**, using **Sequelize** as the ORM against a **PostgreSQL database hosted on Supabase**, with the **Firebase Admin SDK** for server-side authentication and **Supabase Storage** for image uploads.

This README is written directly from the source in this repo (routes, controllers, models, config) — it reflects what's actually implemented.

---

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [File Uploads](#file-uploads)
- [AI Module Integration](#ai-module-integration)
- [Security & Middleware](#security--middleware)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Known Gaps](#known-gaps)

---

## Overview

The backend is the single source of truth all three frontends (`zniyerbuy-mobile`, `zniyerbuy-shop-web`, `zniyerbuy-admin-panel`) talk to. It:

- Verifies Firebase ID tokens and maps them to `public.users` rows
- Exposes CRUD APIs for shops, products, discounts/deals, orders, reviews, favorites, notifications
- Tracks user interactions (`user_interactions`, `recently_viewed`, `search_history`, `user_interests`) as signal data for the AI module
- Proxies AI-powered features (recommendations, trending, demand, insights, predictions) to the Python `zniyerbuy-ai-module` service
- Serves live interactive API docs via Swagger UI

## Architecture

```
        Mobile App / Shop Web / Admin Panel
                       │  HTTPS + Bearer <firebase_id_token>
                       ▼
        ┌───────────────────────────────────┐
        │      Express App (src/app.js)     │
        │  helmet → compression → cors      │
        │  → morgan → requestTime           │
        │  → express.json() → apiLimiter    │
        │  → /docs (Swagger UI)             │
        │  → /api/v1/* route modules        │
        │  → notFound → errorHandler        │
        └───────────────┬───────────────────┘
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
   Sequelize ORM   Supabase JS SDK   firebase-admin
   (Postgres via    (Storage +        (verify ID
    DATABASE_URL)    service-role      tokens)
                      queries)
          │
          ▼
   PostgreSQL (Supabase) — see docs/database.md in zniyerbuy-project-hub
```

The backend also makes outbound HTTP calls to `zniyerbuy-ai-module` (default `http://localhost:8000`) for AI-powered endpoints under `/api/v1/ai/*`.

## Technology Stack

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | HTTP framework |
| sequelize | ^6.37.8 | ORM over PostgreSQL |
| pg / pg-hstore | ^8.22.0 / ^2.3.4 | Postgres driver for Sequelize |
| @supabase/supabase-js | ^2.105.4 | Storage + service-role queries |
| firebase-admin | ^13.9.0 | Verifies Firebase ID tokens |
| helmet | ^8.1.0 | Security headers |
| compression | ^1.8.1 | Gzip response compression |
| cors | ^2.8.6 | Cross-origin requests |
| morgan | ^1.10.1 | Request logging |
| express-rate-limit | ^8.5.2 | Rate limiting |
| express-validator | ^7.3.2 | Request validation |
| multer | ^2.1.1 | Multipart file upload handling |
| swagger-jsdoc / swagger-ui-express | ^6.3.0 / ^5.0.1 | Live API docs at `/docs` |
| uuid | ^14.0.0 | ID generation |
| nodemon (dev) | ^3.1.14 | Dev auto-reload |
| sequelize-cli (dev) | ^6.6.5 | Migrations/seeders |

Node.js 20 is required.

## Project Structure

```
zniyerbuy-backend/
├── server.js                     ← entry point, loads env, starts the HTTP server
├── src/
│   ├── app.js                     ← Express app: middleware + route registration
│   ├── config/
│   │   ├── database.js            ← Sequelize config (reads DATABASE_URL, SSL required)
│   │   ├── env.js                 ← fails fast if required env vars are missing
│   │   ├── firebase.js            ← firebase-admin initialization
│   │   ├── supabase.js            ← Supabase JS client (service-role key)
│   │   └── swagger.js             ← swagger-jsdoc spec config
│   ├── middleware/
│   │   ├── auth.js                ← protect / optionalAuth
│   │   ├── authorize.js           ← role-based access control
│   │   ├── checkShopOwnership.js
│   │   ├── checkProductOwnership.js
│   │   ├── checkDiscountOwnership.js
│   │   ├── checkOrderOwnership.js
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   ├── rateLimiter.js         ← 200 req / 15 min per IP
│   │   ├── requestTime.js
│   │   ├── upload.js              ← multer config (memory storage)
│   │   └── validate.js            ← express-validator result handler
│   ├── models/                    ← Sequelize models: User, Shop, Product, Discounts, Order, OrderItem, Review, index.js
│   ├── routes/                    ← one file per resource (see API Endpoints below)
│   ├── controllers/               ← one file per resource
│   ├── services/                  ← auth, shops, products, database, recommendation, validation
│   ├── validators/                ← express-validator chains per resource
│   ├── migrations/                ← Sequelize migrations (see below)
│   ├── seeders/                   ← demo marketplace data
│   └── utils/                     ← asyncHandler, logger, generateOrderNumber, haversineDistanceKm
├── .env.example
└── package.json
```

## Authentication & Authorization

- Clients sign in with **Firebase Auth** (email/password or OAuth) and send the resulting ID token as `Authorization: Bearer <token>`.
- `middleware/auth.js` exposes:
  - **`protect`** — rejects the request with `401` if the token is missing/invalid; otherwise verifies it via `firebase-admin`, looks up the matching row in `public.users` by `firebase_uid`, and attaches it to `req.user`.
  - **`optionalAuth`** — same verification, but never rejects; proceeds with `req.user` left `undefined` for guests. Used on routes that should stay public but still personalize when the caller is logged in (e.g. `GET /products/search`, `GET /products/:id`).
- **Roles** (from `public.users.role`, default `customer`): `customer`, `shop_owner`, `admin`. Role checks are enforced with `middleware/authorize.js`, e.g. `authorize('shop_owner', 'admin')`.
- **Ownership checks** — `checkShopOwnership`, `checkProductOwnership`, `checkDiscountOwnership`, `checkOrderOwnership` ensure a `shop_owner` can only modify their own shop's resources (admins bypass these checks).

## API Endpoints

Base URL: `http://localhost:5000/api/v1` — full interactive documentation is served live at **`http://localhost:5000/docs`** (Swagger UI, generated from JSDoc comments in every route file). A lightweight JSON version is also available at `GET /api/v1/docs`.

| Mount path | Router file | Covers |
|------------|-------------|--------|
| `/auth` | `auth.routes.js` | Register, get/update own profile |
| `/admin` | `admin.routes.js` | User/shop/product/deal/review/notification moderation, dashboard stats |
| `/shops` | `shop.routes.js` | Nearby search, shop detail, create/update, image update |
| `/products` | `product.routes.js` | CRUD, search, discovery (trending/nearby), personalization (home-feed, recommended, recently-viewed) |
| `/discounts` and `/deals` | `discounts.routes.js` (same router mounted twice) | Deal/promotion CRUD |
| `/orders` | `order.routes.js` | Place order, seller order list, customer's own orders, cancel, update status |
| `/favorites` | `favorite.routes.js` | List/add/remove favorites (product, shop, deal, or discount) |
| `/reviews` | `review.routes.js` | Shop/product reviews, own reviews, shop-owner replies |
| `/notifications` | `notification.routes.js` | List/create in-app notifications |
| `/interactions` | `interaction.routes.js` | Log a user↔product interaction (AI training signal) |
| `/uploads` | `upload.routes.js` | Product/shop image upload → Supabase Storage |
| `/analytics` | `analytics.routes.js` | Admin platform-wide stats + seller-scoped stats |
| `/ai` | `ai.routes.js` | Proxies to `zniyerbuy-ai-module` (recommendations, trending, demand, insights, predictions) |
| `/docs`, `/health`, `/system`, `/test`, `/protected` | `docs.routes.js`, `health.routes.js`, `system.routes.js`, `test.routes.js`, `protected.routes.js` | Docs JSON, health checks, and dev/debug smoke-test routes |

> Full endpoint-by-endpoint reference (methods, params, request/response bodies) lives in `zniyerbuy-project-hub/docs/api-docs.md`, and is always live at `/docs` when the server is running.

### Standard response shape
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "message" }
```

## Database

PostgreSQL, hosted on Supabase. The backend is the schema owner:

- **Sequelize models** (`src/models/`) define `User`, `Shop`, `Product`, `Discounts`, `Order`, `OrderItem`, `Review` and their associations.
- **Migrations** (`src/migrations/`) track schema changes on top of the base schema:
  - `add-profile-favorites-fields` — profile fields (`address`, `nearby_radius_km`) + favorites columns
  - `add-order-customer-and-items` — `orders.customer_id` + the `order_items` table
  - `add-user-interests-constraint-and-rpc` — constraint + RPC for interest scoring
  - `add-admin-dashboard-breakdown-rpcs` — RPC functions backing `/admin/breakdown` and `/admin/trends`
  - `add-is-active-to-users` — `users.is_active` (admin user status toggle)
  - `create-flagged-products` — moderation table for flagged products
- **Seeder** (`src/seeders/`) populates demo shops/products/discounts for local development.

Run migrations/seeders with the Sequelize CLI (see [Installation & Setup](#installation--setup)). The full table-by-table schema is documented in `zniyerbuy-project-hub/docs/database.md`.

## File Uploads

- `POST /api/v1/uploads/product-image` and `POST /api/v1/uploads/shop-image` accept `multipart/form-data` (field name `image`), buffered in memory by `multer`, then pushed to **Supabase Storage** by `upload.controller.js`.
- The returned public URL is then saved onto the resource via `PATCH /products/:id/image` or `PATCH /shops/:id/image`.

## AI Module Integration

`src/controllers/ai.controller.js` proxies requests to the Python AI service at `AI_MODULE_URL` (default `http://localhost:8000`):

| Backend route | AI module route |
|---|---|
| `POST /api/v1/ai/insights` | `POST /insights/generate` |
| `GET /api/v1/ai/recommendations/products` | `GET /recommendations/products` |
| `GET /api/v1/ai/trending/products` | `GET /trending/products` |
| `GET /api/v1/ai/trending/categories` | `GET /trending/categories` |
| `POST /api/v1/ai/demand/predict` | `POST /demand/predict` |
| `GET /api/v1/ai/predictions/shop/:shopId` | `GET /predictions/shop/{shop_id}` |
| `GET /api/v1/ai/health` | `GET /` (connectivity check) |

> The AI module's `demand` and `insights` routers are currently stub endpoints on the Python side — the backend proxy routes exist and work, but will receive a `not_implemented` response until those routers are built out. `recommendations`, `trending`, and `predictions` are fully implemented end-to-end.

## Security & Middleware

- `helmet()` — security headers
- `compression()` — gzip responses
- `cors()` — cross-origin access
- `morgan('dev')` — request logging
- `express-rate-limit` — 200 requests / 15 minutes per IP, applied to all `/api/*` routes
- `express-validator` — per-resource validation chains, checked via `middleware/validate.js`
- Ownership middleware on all mutating shop/product/discount/order routes
- The backend connects to Supabase with the **service-role key**, which bypasses Row Level Security — the API layer itself is the trust boundary, not Postgres RLS

## Installation & Setup

```bash
git clone https://github.com/ShehanRanasinghe/zniyerbuy-backend.git
cd zniyerbuy-backend
npm install

cp .env.example .env
# fill in DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY,
# FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL

# Apply migrations (and optionally seed demo data)
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

npm run dev      # http://localhost:5000, docs at http://localhost:5000/docs
```

## Environment Variables

All of the following are required at startup (`src/config/env.js` throws if any are missing):

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

FIREBASE_PROJECT_ID=zniyerbuy
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@zniyerbuy.iam.gserviceaccount.com

AI_MODULE_URL=http://localhost:8000
```

## Scripts

```bash
npm start   # node server.js
npm run dev # nodemon server.js
```

## Known Gaps

- **Push notifications (FCM):** not implemented — notifications are database-backed and read in-app via `GET /api/v1/notifications`.
- **Docker / CI-CD:** no Dockerfile or GitHub Actions workflow currently exists in this repo.
- **Response caching:** no Redis/in-memory caching layer is currently implemented.

For the full project context (all six ZNIYERBUY repos, database schema, sprint history), see `zniyerbuy-project-hub`.