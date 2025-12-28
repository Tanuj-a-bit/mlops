# API Documentation

## Overview
This document provides comprehensive API documentation for the E-commerce Recommendation System.

## Base URLs
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`
- **ML Service:** `http://localhost:8000`

---

## Backend API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "USER"
}
```

#### POST `/api/auth/signin`
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Products

#### GET `/api/products`
Retrieve all products with optional filtering.

**Query Parameters:**
- `category` (optional): Filter by category slug
- `sortBy` (optional): Sort field (price-low, price-high, rating, newest)
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Premium Wireless Headphones",
    "description": "High-quality audio experience",
    "price": 199.99,
    "image": "https://example.com/image.jpg",
    "category": {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics"
    },
    "rating": 4.5,
    "reviewCount": 128,
    "inStock": true
  }
]
```

#### GET `/api/products/{id}`
Retrieve a specific product by ID.

**Response (200):**
```json
{
  "id": 1,
  "name": "Premium Wireless Headphones",
  "description": "High-quality audio experience with noise cancellation",
  "price": 199.99,
  "image": "https://example.com/image.jpg",
  "category": {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics"
  },
  "rating": 4.5,
  "reviewCount": 128,
  "inStock": true,
  "properties": "{\"color\": \"black\", \"wireless\": true}"
}
```

---

### Categories

#### GET `/api/categories`
Retrieve all product categories.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "slug": "electronics",
    "image": "https://example.com/electronics.jpg",
    "parentId": null
  },
  {
    "id": 2,
    "name": "Smartphones",
    "slug": "smartphones",
    "image": "https://example.com/smartphones.jpg",
    "parentId": 1
  }
]
```

---

### Recommendations

#### GET `/api/v1/recommendations/`
Get personalized recommendations for a user or similar items.

**Query Parameters:**
- `user_id` (optional): User ID for personalized recommendations
- `item_id` (optional): Item ID for similar item recommendations
- `limit` (optional, default: 5): Number of recommendations to return

**Note:** Either `user_id` or `item_id` must be provided.

**Response (200):**
```json
[
  {
    "itemid": 1025,
    "name": "Deluxe Jewelry Elite",
    "categoryid": "11"
  },
  {
    "itemid": 1192,
    "name": "Premium Jewelry Elite",
    "categoryid": "11"
  }
]
```

**Error Response (400):**
```json
{
  "detail": "Must provide user_id or item_id"
}
```

---

### Events

#### POST `/api/v1/events/`
Track user interaction events.

**Request Body:**
```json
{
  "visitorId": 1,
  "eventType": "view",
  "itemId": 1025,
  "timestamp": 1640000000000,
  "transactionId": null
}
```

**Event Types:**
- `view`: User viewed a product
- `addtocart`: User added product to cart
- `transaction`: User completed purchase

**Response (201):**
```json
{
  "id": 1,
  "visitorId": 1,
  "eventType": "view",
  "itemId": 1025,
  "timestamp": 1640000000000
}
```

---

### Monitoring

#### GET `/metrics`
Prometheus metrics endpoint.

**Response (200):**
```
# HELP rec_request_count Total recommendation requests
# TYPE rec_request_count counter
rec_request_count 1250.0

# HELP rec_latency_seconds Time spent processing request
# TYPE rec_latency_seconds histogram
rec_latency_seconds_bucket{le="0.005"} 120.0
rec_latency_seconds_bucket{le="0.01"} 450.0
rec_latency_seconds_bucket{le="+Inf"} 1250.0
rec_latency_seconds_sum 125.5
rec_latency_seconds_count 1250.0

# HELP rec_error_count Total recommendation errors
# TYPE rec_error_count counter
rec_error_count 5.0

# HELP rec_empty_response_count Total times no recommendations were found
# TYPE rec_empty_response_count counter
rec_empty_response_count 12.0

# HELP rec_items_returned_count Number of items returned in recommendation
# TYPE rec_items_returned_count histogram
rec_items_returned_count_bucket{le="5.0"} 200.0
rec_items_returned_count_bucket{le="10.0"} 800.0
rec_items_returned_count_bucket{le="+Inf"} 1250.0

# HELP rec_type_count Type of recommendation served
# TYPE rec_type_count counter
rec_type_count{type="user_personalized"} 1100.0
rec_type_count{type="item_similar"} 150.0
```

---

## ML Service Endpoints

### BPR Model Service

#### POST `/recommend`
Get recommendations from the BPR model.

**Request Body:**
```json
{
  "user_id": 51,
  "n": 10
}
```

**Response (200):**
```json
{
  "user_id": 51,
  "recommendations": [1025, 1192, 1031, 1004, 1116],
  "latency": 0.045
}
```

#### GET `/health`
Check model service health.

**Response (200):**
```json
{
  "status": "healthy",
  "model": "bpr",
  "loaded": true
}
```

---

## Frontend API Routes

### Proxy Endpoints

#### GET `/api/recommendations/`
Proxy endpoint for recommendations (avoids CORS issues).

**Query Parameters:**
- `user_id` (optional): User ID
- `item_id` (optional): Item ID
- `limit` (optional, default: 8): Number of results

**Response:** Same as backend `/api/v1/recommendations/`

---

## Error Codes

### Standard HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Custom Error Responses
```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400
}
```

---

## Rate Limiting
Currently not implemented. Planned for production:
- **Anonymous users:** 100 requests/hour
- **Authenticated users:** 1000 requests/hour
- **Premium users:** Unlimited

---

## Authentication

### JWT Token Structure
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "USER",
  "exp": 1640000000
}
```

### Using Authentication
Include the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Pagination
Currently not implemented. All endpoints return full result sets.

**Planned Implementation:**
```
GET /api/products?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 625,
    "totalPages": 32
  }
}
```

---

## Webhooks (Planned)
Future support for webhooks to notify external systems of events:
- New user registration
- Purchase completion
- Recommendation served

---

## SDK Support (Planned)
Official SDKs planned for:
- Python
- JavaScript/TypeScript
- React Hooks

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Basic CRUD operations
- Recommendation endpoints
- Prometheus metrics

### Planned Features
- Pagination support
- Advanced filtering
- Batch operations
- Webhook support
- Rate limiting
