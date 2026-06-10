# Testing Guide for Creator Dashboard

## What Was Fixed

### Issue 1: Signin/Signup Pages Not Showing
**Problem:** When clicking "Sign in" from main page, it was redirecting to creator dashboard without showing signin form.
**Fix:** Removed auto-redirect checks from signin.html and signup.html so users always see the login form first.

### Issue 2: Role Selection
**Already Working:** The signin.html has Admin/Creator toggle buttons that check role after login.

### Issue 3: "Start Free" Button
**Already Working:** All "Start free" buttons point to signup.html correctly.

## Testing Flow

### Test 1: Sign In Flow
1. Go to `http://localhost:5500/index.html` (or your server URL)
2. Click "Sign in" in navbar
3. **Expected:** You should see signin page with Admin/Creator toggle
4. Select "Creator" toggle
5. Enter email/password of a user with `role='creator'`
6. Click "Sign in as Creator →"
7. **Expected:** Redirected to `/creator/dashboard.html`

### Test 2: Sign Up Flow
1. Go to index.html
2. Click "Start free" button
3. **Expected:** You see signup page
4. Fill form and select "Content creator" radio button
5. Submit form
6. **Expected:** Account created and redirected to `/creator/dashboard.html`

### Test 3: Admin Sign In
1. Go to signin.html
2. Keep "Admin" toggle selected
3. Enter admin credentials
4. **Expected:** Redirected to `/admin/overview.html`

### Test 4: Login as Creator from User Management
1. Sign in as admin
2. Go to User Management
3. Click ··· on any user with role='creator'
4. Click "Login as Creator"
5. **Expected:** Redirected to `/creator/dashboard.html`

## Database Setup

Make sure you have users in your database:

### Create a Creator User
```sql
INSERT INTO users (id, name, email, phone, password_hash, role, status, referral_code, wallet_balance, referral_wallet_balance)
VALUES (
  gen_random_uuid(),
  'Test Creator',
  'creator@test.com',
  '9876543210',
  '$2b$10$your_hashed_password_here',  -- Hash your password
  'creator',  -- Important: role must be 'creator'
  'active',
  'CREATOR123',
  0,
  0
);
```

### Create an Admin User
```sql
INSERT INTO users (id, name, email, phone, password_hash, role, status, referral_code, wallet_balance, referral_wallet_balance)
VALUES (
  gen_random_uuid(),
  'Test Admin',
  'admin@test.com',
  '9876543211',
  '$2b$10$your_hashed_password_here',  -- Hash your password
  'admin',  -- Important: role must be 'admin'
  'active',
  'ADMIN123',
  0,
  0
);
```

## Files Structure

```
frontend/
├── index.html              ✅ All "Start free" buttons work
├── signin.html             ✅ Fixed - Shows form with role toggle
├── signup.html             ✅ Fixed - Shows form with role selection
├── creator/
│   ├── dashboard.html      ✅ Creator landing page
│   ├── my-orders.html      ✅ Orders table
│   ├── digital-training.html ✅ Training videos
│   ├── digital-tools.html  ✅ Tools page
│   ├── hosting-services.html ✅ Hosting details
│   ├── website-design.html ✅ Design details
│   ├── landing-page.html   ✅ Landing page details
│   └── creator.css         ✅ All styling
├── admin/
│   ├── user-management.html ✅ Added "Login as Creator"
│   └── user-management.js   ✅ Redirect logic added
└── js/
    └── auth-api.js         ✅ Updated redirectByRole()
```

## Common Issues

### "This account is not a creator"
- The user's role in database must be 'creator' (lowercase)
- Check: `SELECT role FROM users WHERE email='creator@test.com';`

### Still redirecting without showing form
- Clear browser cache and localStorage
- Run: `localStorage.clear()` in browser console
- Try in incognito mode

### "Start free" button not working
- Check if signup.html exists
- Check browser console for errors
- Verify button code: `<a href="signup.html" class="btn-nav">Start free</a>`

## Success Indicators

✅ Signin page shows with Admin/Creator toggle
✅ Signup page shows with user/creator radio buttons
✅ Creator signin redirects to `/creator/dashboard.html`
✅ Admin signin redirects to `/admin/overview.html`
✅ "Start free" opens signup page
✅ "Login as Creator" in User Management works
✅ All creator pages accessible with creator role

## Need Help?

If issues persist:
1. Check browser console for JavaScript errors
2. Verify backend API is running on port 8001
3. Check database has users with correct roles
4. Clear localStorage and try again
