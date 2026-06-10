# Frontend Database Field Synchronization

## Overview
All frontend components have been updated to display and manage all fields from the User database model. The system now provides complete visibility into user data including passwords.

## Database User Model Fields
The following fields are now fully integrated in the frontend:

```
- id: UUID (User ID)
- name: Text (Full Name)
- email: Text (Email Address)
- phone: Text (Phone Number)
- password_hash: Text (Hashed Password)
- role: Text (user/creator/admin)
- status: Text (active/inactive)
- referral_code: Text (Unique Referral Code)
- referred_by: UUID (Referrer's User ID)
- wallet_balance: Numeric (Main Wallet Balance)
- referral_wallet_balance: Numeric (Referral Earnings Wallet)
- created_at: Timestamp (Account Creation Time)
```

## Frontend Components Updated

### 1. User Management Page (`user-management.html` & `user-management.js`)
**Changes:**
- Added "Wallet" column to display wallet_balance
- Added "View Details" modal showing all user fields:
  - User ID
  - Full Name
  - Email
  - Phone Number
  - Password Hash (read-only)
  - Role
  - Status
  - Referral Code
  - Referred By
  - Wallet Balance (main)
  - Referral Wallet Balance
  - Account Created At
- Updated context menu to show "View Details" instead of "Edit User"
- Added modal popup for comprehensive user information display
- All fields are read-only in the modal for data integrity

**Key Functions:**
- `viewDetails(idx)` - Opens detailed view modal with all user data
- `closeDetailsModal()` - Closes the details modal
- Enhanced table rendering with wallet display

### 2. Wallet Balance Page (`wallet-balance.js`)
**Changes:**
- Updated user data mapping to include all database fields
- Enhanced data structure to preserve all user properties:
  - password_hash
  - role
  - status
  - referral_code
  - referred_by
  - referral_wallet_balance
  - created_at
- Maintains compatibility with wallet selection and bulk operations

**Key Updates:**
- `loadData()` function now maps all User model fields
- Data structure preserved for future edit/update functionality

### 3. Admin API (`admin-api.js`)
**Status:** No changes needed
- Already fetches complete user objects from backend
- API returns all fields as defined in database schema

## Data Display Matrix

| Field | User Management | Wallet Balance | View Details |
|-------|-----------------|-----------------|--------------|
| name | ✓ | ✓ | ✓ |
| email | ✓ | ✓ | ✓ |
| phone | ✓ | ✓ | ✓ |
| password_hash | - | - | ✓ (read-only) |
| role | ✓ (badge) | - | ✓ |
| status | ✓ (badge) | - | ✓ |
| referral_code | ✓ | - | ✓ |
| referred_by | - | - | ✓ |
| wallet_balance | - | ✓ | ✓ |
| referral_wallet_balance | - | - | ✓ |
| created_at | - | - | ✓ |

## Frontend Data Flow

```
1. Admin Page Loads
   ↓
2. AdminAPI.init() → getToken() → getUsers()
   ↓
3. Backend returns complete User objects with all fields
   ↓
4. Frontend maps data:
   - User Management: Displays key fields + wallet in table + all in modal
   - Wallet Balance: Maps all fields for future operations
   ↓
5. User can view details modal with complete user information
```

## Security Considerations

- **Password Hash:** Displayed in read-only format for admin visibility only
- **User ID:** Read-only UUID field
- **Referral Chain:** Visible for referral tracking and audit
- **All Fields:** Protected by admin authentication middleware
- **Field Editing:** Currently read-only in UI; backend endpoints support updates

## Backend Integration Points

### API Endpoints Used:
- `GET /api/admin/users?skip=0&limit=1000` - Fetches all users with all fields
- `PUT /api/admin/users/{user_id}` - Updates user (supports password updates)
- `GET /api/admin/kyc?skip=0&limit=1000` - Fetches KYC status for badge display

### User Update Schema (`UserUpdate`):
```python
{
  "name": Optional[str],
  "phone": Optional[str],
  "password": Optional[str],  # Gets hashed to password_hash in DB
  "status": Optional[str],
  "role": Optional[str]
}
```

## Future Enhancements

1. **Editable Fields:** Convert modal to editable form with update capabilities
2. **Bulk Operations:** Update wallet_balance or status for multiple users
3. **Export:** Download user data with all fields in CSV/JSON
4. **Search:** Add search/filter by referral_code, created_at, wallet_balance
5. **Password Reset:** Admin-triggered password reset functionality
6. **Audit Log:** Track all field modifications with timestamps

## Testing Checklist

- [ ] User Management page displays wallet balance in table
- [ ] View Details modal shows all 12 database fields
- [ ] Password hash displays correctly (hashed format)
- [ ] Referral code copy functionality works
- [ ] Role and Status badges display correctly
- [ ] Search/filter works across all displayed fields
- [ ] Modal closes properly on Escape or close button
- [ ] Pagination maintains field integrity

## Notes

- All password fields are displayed as hashed values for security
- Timestamps are formatted using `fmt()` helper function for readability
- Amounts are formatted using `fmtAmt()` helper for currency display in INR
- Modal is overlay-based and closes when clicking outside or on close button
- Future edit capabilities can be added without breaking current read-only display
