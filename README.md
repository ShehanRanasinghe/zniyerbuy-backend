# ZniyerBuy Backend API

A comprehensive RESTful API backend for the ZniyerBuy marketplace platform, built with Node.js, Express, Firebase Authentication, and Supabase database.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Algorithms & Logic](#algorithms--logic)
- [Middleware Pipeline](#middleware-pipeline)
- [Services & Controllers](#services--controllers)
- [Security Features](#security-features)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

## Overview

The ZniyerBuy Backend serves as the central API layer for a multi-sided marketplace connecting consumers, sellers, and administrators. It handles authentication, product management, shop operations, deals, reviews, favorites, notifications, analytics, and AI-powered recommendations.

**Key Capabilities:**
- User authentication via Firebase with role-based access control (Consumer, Seller, Admin)
- Product catalog management with search, filtering, and pagination
- Shop registration, verification, and management
- Deal creation and management with time-based activation
- User interaction tracking (views, favorites, reviews)
- Real-time recommendation scoring using database triggers
- AI integration for personalized recommendations and demand prediction
- Comprehensive analytics for sellers and administrators
- File upload handling for product and shop images
- Rate limiting and security hardening

## Architecture

### System Design

```
┌─────────────────┐
│   Client Apps   │
│ (Web, Mobile,   │
│  Admin Panel)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Express.js API Server           │
│  ┌───────────────────────────────────┐  │
│  │   Middleware Pipeline             │  │
│  │  - CORS, Helmet, Compression      │  │
│  │  - Rate Limiting (200 req/15min)  │  │
│  │  - Request Logging (Morgan)       │  │
│  │  - JSON Body Parser (10MB limit)  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Route Handlers                  │  │
│  │  - Auth, Products, Shops, Deals   │  │
│  │  - Reviews, Favorites, Analytics  │  │
│  │  - Notifications, Interactions    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Controllers                     │  │
│  │  - Business Logic Layer           │  │
│  │  - Request Validation             │  │
│  │  - Response Formatting            │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Services                        │  │
│  │  - Database Operations            │  │
│  │  - Recommendation Engine          │  │
│  │  - Authentication Service         │  │
│  └───────────────────────────────────┘  │
└─────────┬───────────────────┬───────────┘
          │                   │
          ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│  Firebase Auth   │  │  Supabase DB     │
│  - Token Verify  │  │  - PostgreSQL    │
│  - User Sessions │  │  - Row Level     │
│                  │  │    Security      │
└──────────────────┘  └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────────────────────────────┐
                      │         AI Module (FastAPI)              │
                      │  - Collaborative Filtering               │
                      │  - Demand Prediction (Linear Regression) │
                      │  - Trending Analysis                     │
                      │  - Admin Insights Generation             │
                      └──────────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → API endpoint with optional Bearer token
2. **Middleware Chain** → Security headers, CORS, rate limiting, logging
3. **Route Handler** → Maps URL to controller function
4. **Authentication** → Verifies Firebase token, attaches user to request
5. **Authorization** → Checks user role permissions
6. **Validation** → Validates request body/params using express-validator
7. **Controller** → Executes business logic
8. **Service Layer** → Performs database operations via Supabase
9. **Response** → Returns JSON with success/error status

## Technology Stack

### Core Technologies

- **Runtime:** Node.js (v14+)
- **Framework:** Express.js v5.2.1
- **Language:** JavaScript (ES6+)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Firebase Admin SDK v13.9.0
- **API Documentation:** Swagger (OpenAPI 3.0)

### Why Firebase AND Supabase?

**A common question: Why use two different services instead of one?**

The ZniyerBuy platform uses Firebase and Supabase together because each service excels at different aspects of the application:

**Firebase (Authentication Only):**
- **Purpose:** Handles user authentication and session management
- **Why Firebase?** 
  - Industry-leading authentication service with built-in security
  - Supports multiple authentication methods (Email/Password, Google OAuth, Facebook, Phone, etc.) out of the box
  - Automatic token refresh and session management
  - Client SDKs for Web, iOS, and Android with minimal setup
  - Handles password reset, email verification, and account recovery automatically
  - Battle-tested security with automatic protection against common attacks
  - No need to build and maintain authentication infrastructure
- **What Firebase Does NOT Do:** Store application data (users, products, shops, etc.)

**Supabase (Database Only):**
- **Purpose:** Stores all application data and business logic
- **Why Supabase?**
  - Full-featured PostgreSQL database with advanced querying capabilities
  - Row Level Security (RLS) for fine-grained access control
  - Real-time subscriptions for live data updates
  - Built-in RESTful API with automatic endpoint generation
  - Database triggers and functions for complex business logic (recommendation scoring, rating aggregation)
  - Excellent performance for complex queries and joins
  - Easy to scale and backup
  - Open-source and self-hostable if needed
- **What Supabase Does NOT Do:** Handle authentication (we use Firebase for this)

**How They Work Together:**

1. **User Registration/Login:**
   - User authenticates with Firebase (email/password or OAuth)
   - Firebase returns a secure ID token
   - Backend verifies the token and creates/fetches user profile in Supabase
   - User's `firebase_uid` links their Firebase account to Supabase profile

2. **Authenticated Requests:**
   - Client sends Firebase ID token in request header
   - Backend verifies token with Firebase Admin SDK
   - Backend uses `firebase_uid` to fetch user data from Supabase
   - All business data (products, shops, orders) stored in Supabase

3. **Benefits of This Architecture:**
   - **Separation of Concerns:** Authentication logic separate from business logic
   - **Best of Both Worlds:** Firebase's auth expertise + Supabase's database power
   - **Flexibility:** Can switch database providers without changing auth system
   - **Security:** Firebase handles sensitive auth operations, Supabase handles data with RLS
   - **Developer Experience:** Use Firebase SDKs for auth, Supabase for data queries
   - **Cost Efficiency:** Pay for what you need from each service
   - **Scalability:** Both services scale independently based on usage

**Alternative Approaches (and why we didn't use them):**

- **Firebase Only:** Firebase's Firestore database lacks advanced SQL features, complex queries, and triggers needed for our recommendation engine and analytics
- **Supabase Only:** Would require building custom authentication, OAuth integrations, and session management from scratch
- **Custom Auth + Custom DB:** Would require significant development time and ongoing security maintenance

This dual-service architecture is a common pattern in modern applications (e.g., Auth0 + PostgreSQL, Clerk + Supabase) and provides the best balance of security, functionality, and developer productivity.

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 5.2.1 | Web framework |
| `@supabase/supabase-js` | 2.105.4 | Database client |
| `firebase-admin` | 13.9.0 | Authentication |
| `express-validator` | 7.3.2 | Request validation |
| `express-rate-limit` | 8.5.2 | Rate limiting |
| `helmet` | 8.1.0 | Security headers |
| `cors` | 2.8.6 | Cross-origin requests |
| `multer` | 2.1.1 | File uploads |
| `morgan` | 1.10.1 | HTTP logging |
| `compression` | 1.8.1 | Response compression |
| `swagger-jsdoc` | 6.3.0 | API documentation |
| `swagger-ui-express` | 5.0.1 | API docs UI |
| `uuid` | 14.0.0 | Unique ID generation |
| `dotenv` | 17.4.2 | Environment config |

## Core Features

### 1. Authentication System

**Method:** Firebase ID Token Verification

**Flow:**
1. Client authenticates with Firebase (email/password, Google OAuth, etc.)
2. Client receives Firebase ID token
3. Client sends token in `Authorization: Bearer <token>` header
4. Backend verifies token using Firebase Admin SDK
5. Backend fetches user profile from Supabase using `firebase_uid`
6. User object attached to `req.user` for downstream handlers

**Roles:**
- `consumer` - Regular users (browse, favorite, review)
- `seller` - Shop owners (manage products, deals, analytics)
- `admin` - Platform administrators (full access)

### 2. Product Management

**Features:**
- CRUD operations for products
- Multi-field search (name, description, category)
- Pagination with configurable page size
- Sorting (newest, price ascending/descending)
- Category filtering
- Stock quantity tracking
- Image upload support
- Recommendation score calculation

**Recommendation Scoring Algorithm:**

Products have a `recommendation_score` field updated via database triggers:

```javascript
recommendation_score = 
  (views × 1.0) + 
  (favorites_count × 2.0) + 
  (average_rating × 3.0) + 
  (purchase_count × 5.0)
```

**Weights Rationale:**
- Views (1x): Basic engagement indicator
- Favorites (2x): Stronger intent signal
- Ratings (3x): Quality indicator
- Purchases (5x): Highest conversion signal

### 3. Shop Management

**Verification Workflow:**
1. Seller registers shop with business details
2. Shop status set to `pending`
3. Admin reviews shop information
4. Admin approves (`approved`) or rejects (`rejected`)
5. Only approved shops can create products/deals

**Shop Features:**
- Location-based search (nearby shops using lat/long)
- Shop profile management
- Product catalog per shop
- Performance analytics
- Review aggregation

### 4. Deal System

**Deal Types:**
- Percentage discount (e.g., 20% off)
- Fixed amount discount (e.g., LKR 500 off)

**Deal Lifecycle:**
1. Seller creates deal with start/end dates
2. Deal becomes active when `start_date <= NOW() <= end_date`
3. Deal view count tracked
4. Deal can be toggled active/inactive by seller or admin
5. Expired deals automatically become inactive

**Deal Calculation:**
```javascript
if (discountType === 'percentage') {
  dealPrice = originalPrice × (1 - discountValue / 100)
} else {
  dealPrice = originalPrice - discountValue
}
```

### 5. Recommendation Engine

**Collaborative Filtering (AI Module Integration):**

The backend tracks user interactions and sends data to the AI module for processing:

**Interaction Types:**
- Product views (tracked in `recently_viewed` table)
- Favorites (tracked in `favorites` table)
- Purchases (tracked in `orders` table)
- Ratings (tracked in `reviews` table)

**User Interest Tracking:**

Database function `update_user_interest` maintains category preferences:

```sql
CREATE OR REPLACE FUNCTION update_user_interest(
  p_user_id UUID,
  p_category TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_interests (user_id, category, score)
  VALUES (p_user_id, p_category, 1)
  ON CONFLICT (user_id, category)
  DO UPDATE SET 
    score = user_interests.score + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

**Recommendation Endpoints:**
- `/api/v1/products/recommendations` - Personalized product recommendations
- `/api/v1/products/trending` - Trending products by engagement
- `/api/v1/products/home-feed` - Curated home feed (trending + recommendations)

### 6. Analytics System

**Seller Analytics:**
- Total products, deals, reviews
- Total views, favorites, recommendation score
- Top performing products
- Performance trends

**Admin Analytics:**
- Platform-wide statistics (users, shops, products, deals)
- User growth trends (monthly aggregation)
- Shop verification status breakdown
- Product flagging statistics
- Engagement metrics (interactions, views, favorites)

**Trend Calculation:**

Monthly aggregation query:
```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as count
FROM users
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month ASC
```

### 7. Search & Filtering

**Product Search Algorithm:**

Multi-field text search with PostgreSQL `ILIKE`:

```javascript
query = query
  .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
```

**Search Features:**
- Case-insensitive partial matching
- Search across name and description
- Combined with category filtering
- Sorted by relevance (recommendation_score)

**Search History Tracking:**

Stores user search queries for analytics and personalization:

```javascript
await supabase.from('search_history').insert({
  user_id: userId,
  search_query: keyword,
  results_count: results.length
})
```

### 8. Review System

**Review Aggregation:**

When a review is created, a database trigger updates the shop's average rating:

```sql
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shops
  SET average_rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE shop_id = NEW.shop_id
  )
  WHERE id = NEW.shop_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Review Features:**
- 1-5 star rating
- Optional text comment
- User verification (must be authenticated)
- Shop-level aggregation
- Admin moderation (delete inappropriate reviews)

### 9. Notification System

**Notification Types:**
- `deal` - New deal alerts
- `product` - Product updates
- `shop` - Shop announcements
- `system` - Platform notifications

**Notification Delivery:**
- Created via `/api/v1/notifications` endpoint
- Stored in database with `is_read` flag
- Retrieved per user with unread count
- Mark as read functionality

### 10. File Upload System

**Upload Configuration:**
- Max file size: 10MB
- Allowed formats: JPEG, PNG, WebP
- Storage: Base64 encoding in database
- Endpoints: `/api/v1/uploads/product`, `/api/v1/uploads/shop`

**Upload Flow:**
1. Client sends multipart/form-data with image file
2. Multer middleware processes upload
3. Image converted to base64 string
4. Base64 stored in `image_url` field
5. Frontend displays using `data:image/jpeg;base64,{base64String}`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/products` | List products (paginated, filterable) | No |
| GET | `/api/v1/products/:id` | Get product details | No |
| POST | `/api/v1/products` | Create product | Yes (Seller) |
| PATCH | `/api/v1/products/:id` | Update product | Yes (Owner/Admin) |
| DELETE | `/api/v1/products/:id` | Delete product | Yes (Owner/Admin) |
| GET | `/api/v1/products/trending` | Get trending products | No |
| GET | `/api/v1/products/recommendations` | Get personalized recommendations | Yes |
| GET | `/api/v1/products/recently-viewed` | Get recently viewed products | Yes |
| GET | `/api/v1/products/home-feed` | Get curated home feed | Yes |
| GET | `/api/v1/products/search` | Search products | No |

### Shops

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/shops` | List all shops | No |
| GET | `/api/v1/shops/:id` | Get shop details | No |
| POST | `/api/v1/shops` | Create shop | Yes (Seller) |
| PATCH | `/api/v1/shops/:id` | Update shop | Yes (Owner/Admin) |
| DELETE | `/api/v1/shops/:id` | Delete shop | Yes (Admin) |
| GET | `/api/v1/shops/nearby` | Get nearby shops | No |
| GET | `/api/v1/shops/:id/products` | Get shop products | No |

### Deals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/deals` | List all deals | No |
| GET | `/api/v1/deals/:id` | Get deal details | No |
| POST | `/api/v1/deals` | Create deal | Yes (Seller) |
| PATCH | `/api/v1/deals/:id` | Update deal | Yes (Owner/Admin) |
| DELETE | `/api/v1/deals/:id` | Delete deal | Yes (Owner/Admin) |
| GET | `/api/v1/deals/active` | Get active deals | No |

### Favorites

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/favorites` | Get user favorites | Yes |
| POST | `/api/v1/favorites` | Add to favorites | Yes |
| DELETE | `/api/v1/favorites/:productId` | Remove from favorites | Yes |

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/reviews/shop/:shopId` | Get shop reviews | No |
| POST | `/api/v1/reviews` | Create review | Yes |
| DELETE | `/api/v1/reviews/:id` | Delete review | Yes (Owner/Admin) |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/notifications` | Get user notifications | Yes |
| POST | `/api/v1/notifications` | Create notification | Yes (Admin) |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read | Yes |
| DELETE | `/api/v1/notifications/:id` | Delete notification | Yes (Admin) |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/analytics/seller` | Get seller stats | Yes (Seller) |
| GET | `/api/v1/analytics/seller/top-products` | Get top products | Yes (Seller) |
| GET | `/api/v1/analytics/seller/performance` | Get performance metrics | Yes (Seller) |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/admin/users` | List all users | Yes (Admin) |
| PATCH | `/api/v1/admin/users/:id/role` | Update user role | Yes (Admin) |
| DELETE | `/api/v1/admin/users/:id` | Delete user | Yes (Admin) |
| GET | `/api/v1/admin/shops` | List all shops | Yes (Admin) |
| PATCH | `/api/v1/admin/shops/:id/verify` | Verify shop | Yes (Admin) |
| DELETE | `/api/v1/admin/shops/:id` | Delete shop | Yes (Admin) |
| GET | `/api/v1/admin/products` | List all products | Yes (Admin) |
| PATCH | `/api/v1/admin/products/:id/flag` | Flag/unflag product | Yes (Admin) |
| DELETE | `/api/v1/admin/products/:id` | Delete product | Yes (Admin) |
| GET | `/api/v1/admin/stats` | Get platform statistics | Yes (Admin) |
| GET | `/api/v1/admin/trends` | Get growth trends | Yes (Admin) |

### AI Integration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/ai/insights` | Generate admin insights | Yes (Admin) |
| GET | `/api/v1/ai/recommendations/:userId` | Get AI recommendations | No |
| GET | `/api/v1/ai/demand/:productId` | Predict product demand | Yes (Seller) |

### Uploads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/uploads/product` | Upload product image | Yes (Seller) |
| POST | `/api/v1/uploads/shop` | Upload shop image | Yes (Seller) |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| GET | `/api/v1` | API version info | No |
| GET | `/api-docs` | Swagger documentation | No |

## Authentication & Authorization

### Middleware: `auth.protect`

**Location:** `src/middleware/auth.js`

**Purpose:** Verifies Firebase ID tokens and attaches user to request

**Algorithm:**
```javascript
1. Extract Authorization header
2. Verify format: "Bearer <token>"
3. Extract token
4. Call Firebase Admin SDK: admin.auth().verifyIdToken(token)
5. Extract firebase_uid from decoded token
6. Query Supabase: SELECT * FROM users WHERE firebase_uid = ?
7. If user not found, return 401
8. Attach user to req.user { id, firebase_uid, email, role }
9. Call next()
```

### Middleware: `authorize.roles`

**Location:** `src/middleware/authorize.js`

**Purpose:** Restricts endpoints to specific user roles

**Usage:**
```javascript
router.post('/products', 
  auth.protect, 
  authorize.roles(['seller', 'admin']), 
  productController.createProduct
)
```

**Algorithm:**
```javascript
1. Check if req.user exists (protect middleware must run first)
2. Check if req.user.role is in allowed roles array
3. If yes, call next()
4. If no, return 403 Forbidden
```

### Middleware: `checkShopOwnership`

**Location:** `src/middleware/checkShopOwnership.js`

**Purpose:** Ensures user owns the shop they're modifying

**Algorithm:**
```javascript
1. Extract shopId from req.params
2. Query Supabase: SELECT owner_id FROM shops WHERE id = shopId
3. If shop not found, return 404
4. If shop.owner_id !== req.user.id AND req.user.role !== 'admin', return 403
5. Call next()
```

### Middleware: `checkProductOwnership`

**Location:** `src/middleware/checkProductOwnership.js`

**Purpose:** Ensures user owns the product's shop

**Algorithm:**
```javascript
1. Extract productId from req.params
2. Query Supabase: 
   SELECT products.*, shops.owner_id 
   FROM products 
   JOIN shops ON products.shop_id = shops.id 
   WHERE products.id = productId
3. If product not found, return 404
4. If shops.owner_id !== req.user.id AND req.user.role !== 'admin', return 403
5. Call next()
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'consumer' CHECK (role IN ('consumer', 'seller', 'admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Shops Table

```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  average_rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  unit TEXT DEFAULT 'piece' CHECK (unit IN ('kg', 'piece', 'litre', 'pack', 'dozen', 'metre')),
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  views INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  recommendation_score DECIMAL(10, 2) DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Deals Table

```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  deal_price DECIMAL(10, 2),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Favorites Table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### Reviews Table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT CHECK (type IN ('deal', 'product', 'shop', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Interactions Table

```sql
CREATE TABLE user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('view', 'favorite', 'purchase', 'rating')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Recently Viewed Table

```sql
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### User Interests Table

```sql
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category)
);
```

### Search History Table

```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Algorithms & Logic

### 1. Recommendation Score Calculation

**Trigger Function:**

```sql
CREATE OR REPLACE FUNCTION update_recommendation_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET recommendation_score = (
    (COALESCE(views, 0) * 1.0) +
    (COALESCE(favorites_count, 0) * 2.0) +
    (COALESCE(average_rating, 0) * 3.0) +
    (COALESCE(purchase_count, 0) * 5.0)
  )
  WHERE id = NEW.product_id OR id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Triggers:**
- After INSERT/UPDATE on `products`
- After INSERT on `favorites`
- After INSERT on `user_interactions` (type: purchase)
- After INSERT on `reviews`

### 2. Trending Products Algorithm

**Method:** Multi-factor engagement scoring

**Formula:**
```javascript
trending_score = views + (favorites × 2) + (purchases × 3)
```

**SQL Query:**
```sql
SELECT *,
  (views + (favorites_count * 2) + (purchase_count * 3)) as trending_score
FROM products
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY trending_score DESC
LIMIT 10
```

### 3. Nearby Shops Algorithm

**Method:** Haversine distance formula

**Implementation:**
```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

**Query:**
```sql
SELECT *,
  (
    6371 * acos(
      cos(radians($1)) * cos(radians(latitude)) *
      cos(radians(longitude) - radians($2)) +
      sin(radians($1)) * sin(radians(latitude))
    )
  ) AS distance
FROM shops
WHERE status = 'approved'
HAVING distance <= $3
ORDER BY distance ASC
```

### 4. Home Feed Generation Algorithm

**Strategy:** Hybrid recommendation combining trending and personalized content

**Steps:**
1. Fetch user's top 3 interest categories from `user_interests`
2. Get 5 trending products (highest engagement scores)
3. Get 5 products from user's interest categories
4. Get 5 collaborative filtering recommendations from AI module
5. Merge and deduplicate
6. Sort by recommendation_score
7. Return top 20

**Pseudocode:**
```javascript
async function generateHomeFeed(userId) {
  const interests = await getUserTopInterests(userId, 3);
  const trending = await getTrendingProducts(5);
  const interestBased = await getProductsByCategories(interests, 5);
  const aiRecommendations = await getAIRecommendations(userId, 5);
  
  const combined = [...trending, ...interestBased, ...aiRecommendations];
  const unique = deduplicateById(combined);
  const sorted = sortByRecommendationScore(unique);
  
  return sorted.slice(0, 20);
}
```

### 5. Search Ranking Algorithm

**Method:** Multi-field text search with relevance scoring

**Ranking Factors:**
1. Exact match in name (highest priority)
2. Partial match in name
3. Match in description
4. Recommendation score (tiebreaker)

**SQL Query:**
```sql
SELECT *,
  CASE
    WHEN LOWER(name) = LOWER($1) THEN 100
    WHEN LOWER(name) LIKE LOWER($1 || '%') THEN 50
    WHEN LOWER(name) LIKE LOWER('%' || $1 || '%') THEN 25
    WHEN LOWER(description) LIKE LOWER('%' || $1 || '%') THEN 10
    ELSE 0
  END + (recommendation_score * 0.1) AS relevance_score
FROM products
WHERE 
  LOWER(name) LIKE LOWER('%' || $1 || '%') OR
  LOWER(description) LIKE LOWER('%' || $1 || '%')
ORDER BY relevance_score DESC, recommendation_score DESC
```

## Middleware Pipeline

### Request Processing Order

```
1. helmet()              → Security headers
2. compression()         → Gzip compression
3. cors()                → CORS headers
4. morgan('dev')         → Request logging
5. requestTime           → Timestamp attachment
6. express.json()        → JSON body parsing
7. apiLimiter            → Rate limiting (200/15min)
8. Route Handler         → URL routing
9. auth.protect          → Token verification (if protected)
10. authorize.roles      → Role checking (if restricted)
11. validate             → Request validation
12. Controller           → Business logic
13. errorHandler         → Error formatting
```

### Custom Middleware

#### 1. Request Time Middleware

**File:** `src/middleware/requestTime.js`

**Purpose:** Attaches ISO timestamp to each request

```javascript
module.exports = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};
```

#### 2. Error Handler Middleware

**File:** `src/middleware/errorHandler.js`

**Purpose:** Catches all errors and formats consistent JSON responses

```javascript
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

#### 3. Not Found Middleware

**File:** `src/middleware/notFound.js`

**Purpose:** Handles 404 errors for undefined routes

```javascript
module.exports = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
```

#### 4. Validation Middleware

**File:** `src/middleware/validate.js`

**Purpose:** Processes express-validator results

```javascript
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  next();
};
```

## Services & Controllers

### Service Layer Pattern

**Purpose:** Separates database operations from HTTP handling

**Benefits:**
- Reusable database logic
- Easier testing
- Cleaner controllers
- Single source of truth for queries

**Example:**

```javascript
// Service: src/services/products.service.js
exports.getProducts = async ({ page, limit, category, sort, keyword }) => {
  let query = supabase
    .from('products')
    .select('*, shops(id, name, address)');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (keyword) {
    query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }
  
  // Sorting
  if (sort === 'price_asc') {
    query = query.order('current_price', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('current_price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);
  
  return await query;
};

// Controller: src/controllers/product.controller.js
exports.getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, sort, keyword } = req.query;
  
  const { data, error } = await products.getProducts({
    page: parseInt(page),
    limit: parseInt(limit),
    category,
    sort,
    keyword
  });
  
  if (error) throw error;
  
  res.status(200).json({
    success: true,
    page,
    limit,
    count: data.length,
    data
  });
});
```

### Controller Responsibilities

1. **Request Parsing** - Extract and validate query/body parameters
2. **Service Invocation** - Call appropriate service methods
3. **Error Handling** - Catch and format errors
4. **Response Formatting** - Return consistent JSON structure

### Service Responsibilities

1. **Database Queries** - Construct and execute Supabase queries
2. **Data Transformation** - Format data for controllers
3. **Business Logic** - Implement domain-specific rules
4. **External API Calls** - Integrate with AI module, Firebase, etc.

## Security Features

### 1. Helmet.js Security Headers

**Enabled Headers:**
- `Content-Security-Policy` - Prevents XSS attacks
- `X-DNS-Prefetch-Control` - Controls DNS prefetching
- `X-Frame-Options` - Prevents clickjacking
- `X-Content-Type-Options` - Prevents MIME sniffing
- `Strict-Transport-Security` - Enforces HTTPS
- `X-Download-Options` - Prevents file execution
- `X-Permitted-Cross-Domain-Policies` - Controls cross-domain policies

### 2. CORS Configuration

**Allowed Origins:** Configurable via environment variable

**Allowed Methods:** GET, POST, PATCH, DELETE

**Allowed Headers:** Content-Type, Authorization

### 3. Rate Limiting

**Configuration:**
- Window: 15 minutes
- Max Requests: 200 per IP
- Response: 429 Too Many Requests

**Purpose:** Prevents brute-force attacks and API abuse

### 4. Input Validation

**Method:** express-validator

**Validation Rules:**
- Type checking (string, number, UUID, email)
- Length constraints
- Format validation (dates, enums)
- Sanitization (trim, escape)

**Example:**
```javascript
body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Valid email required'),

body('price')
  .isFloat({ min: 0 })
  .withMessage('Price must be non-negative')
```

### 5. SQL Injection Prevention

**Method:** Parameterized queries via Supabase client

**Example:**
```javascript
// Safe - parameterized
await supabase
  .from('products')
  .select('*')
  .eq('id', productId);

// Unsafe - string concatenation (NEVER DO THIS)
await supabase.rpc('raw_query', {
  query: `SELECT * FROM products WHERE id = '${productId}'`
});
```

### 6. Authentication Token Security

**Token Storage:**
- Client: Stored in memory or secure storage (not localStorage)
- Server: Verified on each request, not stored

**Token Expiration:**
- Firebase tokens expire after 1 hour
- Client must refresh token automatically

**Token Verification:**
```javascript
const decodedToken = await admin.auth().verifyIdToken(token);
// Throws error if token is invalid, expired, or revoked
```

### 7. Role-Based Access Control (RBAC)

**Implementation:**
```javascript
// Only sellers and admins can create products
router.post('/products',
  auth.protect,
  authorize.roles(['seller', 'admin']),
  productController.createProduct
);

// Only admins can delete users
router.delete('/admin/users/:id',
  auth.protect,
  authorize.roles(['admin']),
  adminController.deleteUser
);
```

### 8. Ownership Verification

**Product Ownership:**
```javascript
// User can only update their own products
router.patch('/products/:id',
  auth.protect,
  checkProductOwnership,
  productController.updateProduct
);
```

**Shop Ownership:**
```javascript
// User can only update their own shop
router.patch('/shops/:id',
  auth.protect,
  checkShopOwnership,
  shopController.updateShop
);
```

## Installation & Setup

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Supabase account and project
- Firebase project with Admin SDK credentials

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd zniyerbuy-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# CORS Configuration (optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

4. **Set up database schema**

Run the SQL migrations in your Supabase SQL editor:
- Create tables (users, shops, products, deals, etc.)
- Create triggers for recommendation scoring
- Create database functions (update_user_interest, etc.)

5. **Start the development server**
```bash
npm run dev
```

6. **Verify installation**

Visit `http://localhost:5000/health` - should return:
```json
{
  "success": true,
  "message": "ZNIYERBUY API is running"
}
```

7. **Access API documentation**

Visit `http://localhost:5000/api-docs` for interactive Swagger UI

### Production Deployment

1. **Set environment to production**
```env
NODE_ENV=production
```

2. **Use production database credentials**

3. **Enable HTTPS** (required for Firebase tokens)

4. **Configure CORS** with specific allowed origins

5. **Set up process manager** (PM2, systemd, etc.)
```bash
npm install -g pm2
pm2 start server.js --name zniyerbuy-api
pm2 save
pm2 startup
```

6. **Configure reverse proxy** (Nginx, Apache)

Example Nginx configuration:
```nginx
server {
  listen 80;
  server_name api.zniyerbuy.com;
  
  location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `5000` |
| `NODE_ENV` | No | Environment | `development` or `production` |
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key | `eyJhbGc...` |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID | `zniyerbuy-app` |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase private key | `-----BEGIN PRIVATE KEY-----...` |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase service account email | `firebase-adminsdk@...` |
| `ALLOWED_ORIGINS` | No | CORS allowed origins | `http://localhost:3000` |

## API Documentation

### Swagger/OpenAPI

**Access:** `http://localhost:5000/api-docs`

**Features:**
- Interactive API explorer
- Request/response schemas
- Authentication testing
- Example requests

**Configuration:** `src/config/swagger.js`

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "errors": [ ... ] // Validation errors
}
```

**Paginated Response:**
```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "count": 10,
  "data": [ ... ]
}
```

### Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

**Version:** 1.0.0  
**Last Updated:** 2026-06-13  
**Maintained By:** ZniyerBuy Development Team
