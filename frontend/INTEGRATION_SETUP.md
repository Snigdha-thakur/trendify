# Trendify Frontend - Backend API Integration

## Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create `.env` file in frontend root:
```
VITE_API_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Integration Features

✅ **Authentication API** - Login, register, token refresh
✅ **Product Management** - Browse, upload, download products
✅ **Course Management** - Browse, enroll, view progress
✅ **Payment Processing** - Stripe integration
✅ **User Profile** - Update profile, settings
✅ **Admin Dashboard** - View stats, manage users
✅ **Real-time Notifications** - WebSocket connection
✅ **Affiliate Program** - Referral tracking

## API Service Usage

### Login Example
```javascript
import { authService } from './js/services/auth.js';

// Login
const user = await authService.login('email@example.com', 'password');
console.log(user); // User object

// Check if logged in
if (authService.isLoggedIn()) {
  console.log('User is authenticated');
}

// Logout
authService.logout();
```

### API Calls Example
```javascript
import { apiService } from './js/services/api.js';

// Get current user
const user = await apiService.get('/api/users/me');

// Get products
const products = await apiService.get('/api/products/?limit=10');

// Create product (with file upload)
const formData = new FormData();
formData.append('title', 'My Product');
formData.append('price', 29.99);
formData.append('file', fileInput.files[0]);
const product = await apiService.post('/api/products/create', formData);
```

## File Structure

```
frontend/
├── index.html
├── signin.html
├── signup.html
├── dashboard.html
├── products.html
├── courses.html
├── payments.html
├── admin/
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── services/
│   │   ├── api.js           # Base API service
│   │   ├── auth.js          # Authentication service
│   │   ├── products.js      # Products service
│   │   ├── courses.js       # Courses service
│   │   ├── payments.js      # Payments service
│   │   ├── wallet.js        # Wallet & affiliate service
│   │   └── realtime.js      # WebSocket service
│   └── utils/
│       ├── config.js        # Configuration
│       └── storage.js       # Local storage utilities
├── .env                     # Environment variables
├── vite.config.js
└── package.json
```

## Configuration

All API URLs are configurable via environment variables. Update `.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_FRONTEND_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_STRIPE=true
VITE_ENABLE_REALTIME=true

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
```

## Next Steps

1. Update HTML pages to use API services
2. Add form submission handlers
3. Implement data binding
4. Add error handling and loading states
5. Connect WebSocket for real-time updates

See [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) for detailed integration instructions.
