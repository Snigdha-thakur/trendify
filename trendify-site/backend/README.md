# Trendify Backend API

Complete backend API built with FastAPI for the Trendify platform - a comprehensive digital courses and products marketplace.

## Features

✅ **User Authentication** - JWT-based authentication with refresh tokens
✅ **Digital Products** - Upload, sell, and download digital products
✅ **Online Courses** - Create courses with lessons and track student progress
✅ **Payment Processing** - Stripe integration for secure payments
✅ **Real-time Updates** - WebSocket support for real-time notifications
✅ **File Management** - Secure file upload and download system
✅ **Admin Dashboard** - Complete admin panel for platform management
✅ **Affiliate System** - Referral program for creators and users

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/           # API endpoint handlers
│   │       ├── auth.py       # Authentication endpoints
│   │       ├── users.py      # User management
│   │       ├── products.py   # Digital products
│   │       ├── courses.py    # Course management
│   │       ├── payments.py   # Payment processing
│   │       ├── admin.py      # Admin operations
│   │       └── realtime.py   # WebSocket & real-time
│   ├── core/
│   │   ├── config.py         # Configuration settings
│   │   ├── database.py       # Database connection
│   │   └── security.py       # JWT & password utilities
│   ├── models/
│   │   └── models.py         # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py        # Pydantic schemas
│   ├── services/
│   │   └── stripe_service.py # Stripe payment service
│   ├── utils/
│   │   └── file_handler.py   # File upload utilities
│   └── main.py               # FastAPI application entry point
├── uploads/                  # User uploaded files
├── logs/                     # Application logs
├── requirements.txt          # Python dependencies
├── .env.local                # Environment variables
└── README.md                 # This file
```

## Setup & Installation

### Prerequisites
- Python 3.8+
- PostgreSQL (or use Supabase)
- pip or conda

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy and update `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Database credentials
- Supabase configuration
- JWT secret key
- Stripe API keys
- Frontend URL

### 4. Initialize Database

```bash
# Create tables
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### 5. Run Development Server

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative API Docs: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/{user_id}` - Get user profile
- `GET /api/users` - List all users
- `POST /api/users/{user_id}/make-creator` - Make user a creator

### Digital Products
- `POST /api/products/create` - Upload product
- `GET /api/products/` - List products
- `GET /api/products/{product_id}` - Get product details
- `PUT /api/products/{product_id}` - Update product
- `DELETE /api/products/{product_id}` - Delete product
- `POST /api/products/{product_id}/download` - Download product
- `GET /api/products/creator/{creator_id}` - Get creator's products

### Courses
- `POST /api/courses/create` - Create course
- `GET /api/courses/` - List courses
- `GET /api/courses/{course_id}` - Get course details
- `PUT /api/courses/{course_id}` - Update course
- `DELETE /api/courses/{course_id}` - Delete course
- `POST /api/courses/{course_id}/lessons` - Add lesson
- `GET /api/courses/{course_id}/lessons` - Get lessons
- `POST /api/courses/{course_id}/enroll` - Enroll in course

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/orders` - Get user orders
- `GET /api/payments/payments` - Get user payments
- `POST /api/payments/webhook/stripe` - Stripe webhook handler

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `POST /api/admin/users/{user_id}/toggle-admin` - Toggle admin status
- `GET /api/admin/products` - List all products
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/payments` - List all payments
- `GET /api/admin/courses` - List all courses

### Real-time
- `WS /api/realtime/ws/{token}` - WebSocket connection
- `GET /api/realtime/notifications` - Get notifications
- `POST /api/realtime/notifications/{notification_id}/mark-read` - Mark as read
- `POST /api/realtime/notifications/mark-all-read` - Mark all as read

## Database Models

### User
- Email, username, password (hashed)
- Profile info (name, picture, bio)
- Admin & creator flags
- Timestamps

### DigitalProduct
- Creator reference
- Title, description, price
- File path, thumbnail
- Category, active status
- Download count

### Course
- Instructor reference
- Title, description, price
- Duration, thumbnail
- Publication status
- Student count

### Lesson
- Course reference
- Title, content, video URL
- Order, duration
- Associated with course

### Order
- User & product reference
- Order number, amount
- Status (pending, completed, failed)
- Stripe payment ID

### Payment
- User & order reference
- Amount, currency
- Stripe charge ID
- Payment method, status

### Wallet
- User reference
- Balance, total earned, total withdrawn
- Currency
- Associated transactions

### Affiliate
- User reference
- Affiliate code
- Commission rate
- Referral stats

### Notification
- User reference
- Title, message
- Type (order, payment, course, system)
- Read status, link

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - BCrypt for password security
- **CORS** - Cross-origin resource sharing protection
- **Input Validation** - Pydantic schema validation
- **Admin Authorization** - Role-based access control
- **File Validation** - File type and size restrictions
- **SQL Injection Prevention** - SQLAlchemy ORM usage
- **Secure Headers** - HTTPS ready

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/db

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Server
DEBUG=True
ENVIRONMENT=development
API_TITLE=Trendify API
API_VERSION=1.0.0

# CORS
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# File Upload
MAX_UPLOAD_SIZE=104857600
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,mp4,webm
```

## Development

### Running Tests (if added)
```bash
pytest
```

### Code Formatting
```bash
# Format code with black
black app/

# Sort imports with isort
isort app/
```

### Database Migrations (with Alembic)
```bash
# Create migration
alembic revision --autogenerate -m "Migration message"

# Apply migrations
alembic upgrade head

# Revert migration
alembic downgrade -1
```

## Deployment

### Production Server (Gunicorn + Uvicorn)
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

### Environment Variables for Production
- Set `DEBUG=False`
- Set `ENVIRONMENT=production`
- Use strong `SECRET_KEY`
- Update database credentials
- Configure HTTPS/SSL
- Set proper CORS origins

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database credentials
- Ensure PostgreSQL is running
- Test connection with psql

### Stripe Integration Issues
- Verify API keys are correct
- Check webhook signing secret
- Ensure webhook URL is accessible
- Test with Stripe CLI for local webhooks

### File Upload Issues
- Check `uploads/` directory permissions
- Verify `MAX_UPLOAD_SIZE` setting
- Confirm `ALLOWED_EXTENSIONS`
- Ensure sufficient disk space

## Contributing

1. Create a feature branch
2. Make changes with proper commits
3. Test thoroughly
4. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, bug reports, or feature requests, please open an issue in the repository.

---

Built with FastAPI, SQLAlchemy, and PostgreSQL 🚀
