# Trendify API Documentation

Complete API endpoint reference for Trendify backend.

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Get your access token by logging in via `/api/auth/login`

---

## Authentication Endpoints

### Register User
```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "profile_picture": null,
  "bio": null,
  "is_active": true,
  "is_admin": false,
  "is_creator": false,
  "created_at": "2024-01-01T12:00:00"
}
```

### Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Refresh Token
```
POST /api/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "your_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "token_type": "bearer"
}
```

---

## User Endpoints

### Get Current User Profile
```
GET /api/users/me
```

**Headers:** Authorization required

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "profile_picture": "https://...",
  "bio": "User bio",
  "is_active": true,
  "is_admin": false,
  "is_creator": true,
  "created_at": "2024-01-01T12:00:00"
}
```

### Update Current User Profile
```
PUT /api/users/me
```

**Headers:** Authorization required

**Request:**
```json
{
  "full_name": "Updated Name",
  "bio": "Updated bio",
  "profile_picture": "https://example.com/pic.jpg"
}
```

**Response:** Updated user object

### Get User by ID
```
GET /api/users/{user_id}
```

**Response:** User object

### List All Users
```
GET /api/users?skip=0&limit=10
```

**Response:**
```json
{
  "total": 100,
  "skip": 0,
  "limit": 10,
  "users": [...]
}
```

### Make User a Creator
```
POST /api/users/{user_id}/make-creator
```

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "message": "User is now a creator"
}
```

---

## Digital Products Endpoints

### Create Product
```
POST /api/products/create
```

**Headers:** Authorization required, Content-Type: multipart/form-data

**Form Data:**
- `title` (string, required) - Product title
- `description` (string, optional) - Product description
- `price` (float, required) - Product price
- `category` (string, optional) - Product category
- `file` (file, required) - Product file

**Response:** Product object

### List Products
```
GET /api/products/?skip=0&limit=10&category=software
```

**Query Parameters:**
- `skip` (int) - Skip n products
- `limit` (int) - Limit results
- `category` (string, optional) - Filter by category

**Response:**
```json
[
  {
    "id": 1,
    "creator_id": 1,
    "title": "Product Name",
    "description": "Description",
    "price": 29.99,
    "thumbnail": "https://...",
    "category": "software",
    "downloads": 5,
    "is_active": true,
    "created_at": "2024-01-01T12:00:00"
  }
]
```

### Get Product Details
```
GET /api/products/{product_id}
```

**Response:** Product object

### Update Product
```
PUT /api/products/{product_id}
```

**Headers:** Authorization required

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 39.99,
  "category": "ebooks"
}
```

**Response:** Updated product object

### Delete Product
```
DELETE /api/products/{product_id}
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

### Get Creator's Products
```
GET /api/products/creator/{creator_id}
```

**Response:** List of products

### Download Product
```
POST /api/products/{product_id}/download
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Download link generated",
  "file_path": "uploads/products/...",
  "file_url": "http://localhost:8000/uploads/products/..."
}
```

---

## Course Endpoints

### Create Course
```
POST /api/courses/create
```

**Headers:** Authorization required

**Request:**
```json
{
  "title": "Course Title",
  "description": "Course description",
  "price": 99.99,
  "duration_hours": 10
}
```

**Response:** Course object

### List Courses
```
GET /api/courses/?skip=0&limit=10&published_only=true
```

**Query Parameters:**
- `skip` (int) - Skip n courses
- `limit` (int) - Limit results
- `published_only` (bool) - Only published courses

**Response:** List of courses

### Get Course Details
```
GET /api/courses/{course_id}
```

**Response:** Course object

### Update Course
```
PUT /api/courses/{course_id}
```

**Headers:** Authorization required

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 119.99,
  "is_published": true
}
```

**Response:** Updated course object

### Delete Course
```
DELETE /api/courses/{course_id}
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Course deleted successfully"
}
```

### Create Lesson
```
POST /api/courses/{course_id}/lessons
```

**Headers:** Authorization required

**Request:**
```json
{
  "title": "Lesson 1",
  "content": "Lesson content",
  "video_url": "https://example.com/video.mp4",
  "order": 1,
  "duration_minutes": 45
}
```

**Response:** Lesson object

### Get Course Lessons
```
GET /api/courses/{course_id}/lessons
```

**Response:** List of lessons

### Enroll in Course
```
POST /api/courses/{course_id}/enroll
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Enrolled successfully",
  "enrollment_id": 1
}
```

### Get Enrolled Courses
```
GET /api/courses/{course_id}/enrolled-courses
```

**Headers:** Authorization required

**Response:** List of enrolled courses

---

## Payment Endpoints

### Create Payment Intent
```
POST /api/payments/create-payment-intent
```

**Headers:** Authorization required

**Request:**
```json
{
  "amount": 29.99,
  "currency": "usd",
  "order_id": 1
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

### Confirm Payment
```
POST /api/payments/confirm-payment
```

**Headers:** Authorization required

**Request:**
```json
{
  "payment_intent_id": "pi_xxx",
  "order_id": 1
}
```

**Response:**
```json
{
  "message": "Payment confirmed successfully",
  "payment_id": 1,
  "status": "succeeded"
}
```

### Get User Orders
```
GET /api/payments/orders
```

**Headers:** Authorization required

**Response:** List of orders

### Get User Payments
```
GET /api/payments/payments
```

**Headers:** Authorization required

**Response:** List of payments

### Stripe Webhook
```
POST /api/payments/webhook/stripe
```

**Request:** Stripe webhook payload

---

## Wallet & Affiliate Endpoints

### Get Wallet Balance
```
GET /api/wallets/balance
```

**Headers:** Authorization required

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "balance": 500.00,
  "currency": "USD",
  "total_earned": 1000.00,
  "total_withdrawn": 500.00,
  "created_at": "2024-01-01T12:00:00"
}
```

### Get Transactions
```
GET /api/wallets/transactions?skip=0&limit=10
```

**Headers:** Authorization required

**Response:**
```json
{
  "total": 20,
  "skip": 0,
  "limit": 10,
  "transactions": [...]
}
```

### Request Withdrawal
```
POST /api/wallets/withdraw
```

**Headers:** Authorization required

**Request:**
```json
{
  "amount": 100.00
}
```

**Response:**
```json
{
  "message": "Withdrawal request submitted",
  "transaction_id": 1,
  "amount": 100.00,
  "status": "pending"
}
```

### Get Affiliate Info
```
GET /api/wallets/affiliate/info
```

**Headers:** Authorization required

**Response:** Affiliate object

### Generate Affiliate Code
```
POST /api/wallets/affiliate/generate-code
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Affiliate code created",
  "affiliate_code": "username-abc123",
  "commission_rate": 10.0
}
```

### Get Affiliate Stats
```
GET /api/wallets/affiliate/stats
```

**Headers:** Authorization required

**Response:**
```json
{
  "affiliate_code": "username-abc123",
  "commission_rate": 10.0,
  "total_referrals": 5,
  "total_earned": 500.00,
  "is_active": true,
  "created_at": "2024-01-01T12:00:00",
  "referral_link": "https://trendify.com/?ref=username-abc123"
}
```

### Toggle Affiliate Status
```
POST /api/wallets/affiliate/toggle-active
```

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Affiliate activated",
  "is_active": true
}
```

---

## Real-time & Notifications

### WebSocket Connection
```
WS /api/realtime/ws/{token}
```

Replace `{token}` with your access token.

**Example:**
```javascript
const socket = new WebSocket('ws://localhost:8000/api/realtime/ws/your_access_token');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};

// Send ping to keep connection alive
socket.send(JSON.stringify({ type: 'ping' }));
```

### Get Notifications
```
GET /api/realtime/notifications?unread_only=false&skip=0&limit=10
```

**Headers:** Authorization required

**Query Parameters:**
- `user_id` (int, required) - User ID
- `unread_only` (bool) - Only unread
- `skip` (int) - Skip n notifications
- `limit` (int) - Limit results

**Response:**
```json
{
  "total": 5,
  "skip": 0,
  "limit": 10,
  "notifications": [...]
}
```

### Mark Notification as Read
```
POST /api/realtime/notifications/{notification_id}/mark-read
```

**Headers:** Authorization required

### Mark All as Read
```
POST /api/realtime/notifications/mark-all-read
```

**Headers:** Authorization required

**Request:**
```json
{
  "user_id": 1
}
```

### Delete Notification
```
DELETE /api/realtime/notifications/{notification_id}
```

**Headers:** Authorization required

---

## Admin Endpoints

### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
```

**Headers:** Authorization required (Admin only)

**Response:**
```json
{
  "total_users": 100,
  "total_products": 50,
  "total_courses": 20,
  "total_orders": 200,
  "completed_orders": 180,
  "total_revenue": 5000.00
}
```

### Get All Users
```
GET /api/admin/users?skip=0&limit=10
```

**Headers:** Authorization required (Admin only)

### Toggle User Admin Status
```
POST /api/admin/users/{user_id}/toggle-admin
```

**Headers:** Authorization required (Admin only)

### Toggle User Active Status
```
POST /api/admin/users/{user_id}/toggle-active
```

**Headers:** Authorization required (Admin only)

### Get All Products
```
GET /api/admin/products?skip=0&limit=10
```

**Headers:** Authorization required (Admin only)

### Delete Product (Admin)
```
DELETE /api/admin/products/{product_id}
```

**Headers:** Authorization required (Admin only)

### Get All Orders
```
GET /api/admin/orders?skip=0&limit=10&status=completed
```

**Headers:** Authorization required (Admin only)

### Get All Payments
```
GET /api/admin/payments?skip=0&limit=10&status=succeeded
```

**Headers:** Authorization required (Admin only)

### Get All Courses
```
GET /api/admin/courses?skip=0&limit=10
```

**Headers:** Authorization required (Admin only)

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Permission denied"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently not implemented, but can be added using `slowapi` or similar middleware.

---

## API Status Endpoints

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

### API Info
```
GET /
```

**Response:**
```json
{
  "message": "Welcome to Trendify API",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc"
}
```

---

## Interactive API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Client-side Integration Examples

### JavaScript/Fetch

```javascript
// Register
const register = async () => {
  const response = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      username: 'username',
      password: 'securepassword123'
    })
  });
  const data = await response.json();
  return data;
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
};

// Get Current User
const getCurrentUser = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/api/users/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data;
};
```

---

## Support

For issues or questions, please open an issue in the repository.
