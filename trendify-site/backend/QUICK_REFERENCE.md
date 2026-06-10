# Trendify Backend - Quick Reference Guide

## Project Overview

A complete FastAPI backend for Trendify - a digital courses and products marketplace platform with integrated payment processing, real-time notifications, and admin management.

## Quick Start (5 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Run startup script
# Windows:
run.bat
# Or Mac/Linux:
bash run.sh

# 3. Server starts at http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

The startup script automatically:
- Creates virtual environment
- Installs dependencies
- Creates `.env.local` (if missing)
- Starts FastAPI server

## Project Structure

```
backend/
├── app/
│   ├── api/routes/          # API endpoints
│   │   ├── auth.py          # Authentication
│   │   ├── users.py         # User management
│   │   ├── products.py      # Digital products
│   │   ├── courses.py       # Online courses
│   │   ├── payments.py      # Payment processing
│   │   ├── wallets.py       # Wallets & affiliates
│   │   ├── admin.py         # Admin operations
│   │   └── realtime.py      # WebSocket notifications
│   ├── core/
│   │   ├── config.py        # Settings
│   │   ├── database.py      # DB connection
│   │   └── security.py      # JWT & hashing
│   ├── models/
│   │   └── models.py        # 11 ORM models
│   ├── schemas/
│   │   └── schemas.py       # Pydantic validation
│   ├── services/
│   │   └── stripe_service.py # Stripe integration
│   ├── utils/
│   │   └── file_handler.py  # File operations
│   └── main.py              # FastAPI app
├── uploads/                 # Uploaded files
├── requirements.txt         # Dependencies
├── .env.local              # Config (Supabase included)
├── .env.example            # Config template
├── run.bat / run.sh        # Start scripts
├── README.md               # Full documentation
├── API_DOCUMENTATION.md    # API reference
└── QUICK_REFERENCE.md      # This file
```

## Main API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/users/me` | Get current user |
| GET | `/api/products/` | List products |
| POST | `/api/products/create` | Upload product |
| GET | `/api/courses/` | List courses |
| POST | `/api/courses/create` | Create course |
| POST | `/api/payments/create-payment-intent` | Stripe payment |
| GET | `/api/wallets/balance` | Get wallet balance |
| GET | `/api/admin/dashboard/stats` | Admin dashboard |

**For complete API reference**, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Environment Variables

Already configured in `.env.local`:

```
SUPABASE_URL=https://hzukzpxelruvdmporrak.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres.hzukzpxelruvdmporrak:Snigdhathakur@...
```

**You need to add:**
```
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
SECRET_KEY=your-min-32-char-secret-key-for-production
```

## Development Commands

### Run Development Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run with auto-reload
```bash
# Uses --reload to auto-restart on file changes
python -m uvicorn app.main:app --reload
```

### Access API Documentation
```
Swagger: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
```

### Health Check
```bash
curl http://localhost:8000/health
```

## Database Models

### User
- Email, username, hashed password
- Profile (name, picture, bio)
- Admin & creator flags

### DigitalProduct
- Creator, title, price
- File path, category
- Download count

### Course
- Instructor, title, price
- Duration, student count
- Published status

### Lesson
- Course reference
- Title, content, video
- Order, duration

### Order
- User & product reference
- Amount, status
- Stripe payment ID

### Payment
- User & order reference
- Amount, currency
- Status (pending/succeeded/failed)

### Wallet
- User balance
- Total earned/withdrawn
- Transactions

### Affiliate
- User reference
- Referral code
- Commission rate
- Referral stats

## Authentication Flow

```
1. User registers → POST /api/auth/register
2. Returns user object with success
3. User logs in → POST /api/auth/login
4. Returns access_token & refresh_token
5. Include token in requests: Authorization: Bearer <token>
6. Token expires → Use refresh_token → GET /api/auth/refresh
7. Get new access_token
```

## File Upload

Accepted file types:
```
Images: jpg, jpeg, png, gif
Documents: pdf
Videos: mp4, webm
```

Max file size: 100MB

Files uploaded to `uploads/products/` or `uploads/courses/`

## Frontend Integration

Update `FRONTEND_URL` in `.env.local` if frontend runs on different port:

```env
FRONTEND_URL=http://localhost:3000
```

CORS automatically allows this URL.

## Payment Processing (Stripe)

1. Frontend calls `/api/payments/create-payment-intent`
2. Backend creates Stripe PaymentIntent
3. Returns `client_secret` to frontend
4. Frontend uses Stripe.js to handle payment
5. Frontend confirms payment → `/api/payments/confirm-payment`
6. Backend verifies and creates Payment record

## Real-time Features

WebSocket endpoint: `ws://localhost:8000/api/realtime/ws/{token}`

```javascript
// Connect
const socket = new WebSocket(
  'ws://localhost:8000/api/realtime/ws/your_access_token'
);

// Listen for notifications
socket.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log(notification);
};

// Send ping to keep alive
socket.send(JSON.stringify({ type: 'ping' }));
```

## Admin Features

Only users with `is_admin=true` can access:

- **Dashboard Stats**: Total users, products, courses, revenue
- **User Management**: Toggle admin/active status
- **Product Management**: View/delete products
- **Order Management**: View all orders
- **Payment Management**: View payment history
- **Course Management**: View all courses

## Common Issues & Solutions

### Database Connection Error
- Check `DATABASE_URL` in `.env.local`
- Verify PostgreSQL/Supabase is running
- Test with: `psql <DATABASE_URL>`

### Port Already in Use
```bash
# Use different port
python -m uvicorn app.main:app --port 8001
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### CORS Issues
- Check `FRONTEND_URL` in `.env.local`
- Must match frontend's actual URL and port

### Stripe Payment Fails
- Verify API keys in `.env.local`
- Check Stripe account status
- Test with Stripe test cards

## Testing API

### Using curl
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass123"}'

# Get current user (with token)
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman
1. Import collection from `/docs` endpoint
2. Set variables for `base_url`, `access_token`
3. Test endpoints

## Useful Extensions

**Optional packages for production:**

```bash
# Database migrations
pip install alembic

# Testing
pip install pytest pytest-asyncio

# Code quality
pip install black isort flake8

# Monitoring
pip install prometheus-client
```

## Performance Tips

1. **Use pagination** - Always use `skip` and `limit` parameters
2. **Cache responses** - Add caching layer for frequently accessed data
3. **Optimize queries** - Use eager loading for relationships
4. **Connection pooling** - Already configured in database.py
5. **Add indexes** - To commonly queried fields

## Security Checklist

- [x] Password hashing with bcrypt
- [x] JWT token authentication
- [x] CORS protection
- [x] Input validation with Pydantic
- [x] SQL injection prevention (ORM)
- [ ] Rate limiting (TODO - add slowapi)
- [ ] HTTPS in production
- [ ] Secure headers (TODO - add Helmet)
- [ ] CSRF protection (TODO)
- [ ] API key rotation

## Deployment

### Production Checklist

1. Set `DEBUG=False`
2. Use strong `SECRET_KEY` (32+ chars)
3. Enable HTTPS/SSL
4. Update `FRONTEND_URL` to production domain
5. Use production database
6. Use Gunicorn with multiple workers
7. Add reverse proxy (Nginx)
8. Enable monitoring
9. Set up logging
10. Regular backups

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build & run:
```bash
docker build -t trendify-backend .
docker run -p 8000:8000 -e DATABASE_URL=... trendify-backend
```

## Support & Documentation

- **Full API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Setup Guide**: [README.md](README.md)
- **Interactive Docs**: http://localhost:8000/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Stripe Docs**: https://stripe.com/docs

---

**Backend is fully functional and ready for integration with frontend!** 🚀
