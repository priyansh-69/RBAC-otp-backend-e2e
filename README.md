# RBAC with OTP Login and Logging — Backend Assignment

A backend system where users log in using mobile number + OTP. After login, users access APIs based on their assigned role. The system maintains logs for OTP events, login attempts, access denied events, and user management actions.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger (OpenAPI 3.0)


## Features

- OTP-based authentication (6-digit OTP with configurable expiry)
- JWT access tokens + refresh tokens
- Role-Based Access Control (RBAC) with 4 roles
- Comprehensive logging for 10 event types
- Input validation and error handling
- OTP request rate limiting
- Swagger API documentation

- Seed script for sample data

## Roles & Permissions

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full access |
| ADMIN | Manage users and view logs |
| MANAGER | View users only |
| USER | View own profile only |

## Project Structure

```
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js  # Auth (OTP send/verify, refresh token)
│   │   ├── userController.js  # User CRUD operations
│   │   └── logController.js   # Log retrieval
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── rbac.js            # Role-based access control
│   │   ├── validate.js        # Input validation
│   │   ├── rateLimiter.js     # Rate limiting
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Otp.js             # OTP schema
│   │   └── Log.js             # Log schema
│   ├── routes/
│   │   ├── authRoutes.js      # /auth routes
│   │   ├── userRoutes.js      # /users routes
│   │   └── logRoutes.js       # /logs routes
│   ├── services/
│   │   ├── otpService.js      # OTP generation/verification
│   │   ├── tokenService.js    # JWT token management
│   │   ├── logService.js      # Centralized logging
│   │   └── smsService.js      # Mock SMS service
│   ├── utils/
│   │   ├── ApiError.js        # Custom error class
│   │   └── constants.js       # Roles and log actions
│   ├── app.js                 # Express app configuration
│   ├── server.js              # Server entry point
│   └── seed.js                # Database seeding script
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) running locally

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd assignment
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your MongoDB URI and JWT secrets.

4. **Start MongoDB** (if not already running):
   ```bash
   mongod
   ```

5. **Seed the database** (creates sample users and logs):
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

7. **Access the API:**
   - Base URL: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/api-docs`



## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/rbac_otp_db |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | Access token expiry | 15m |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| OTP_EXPIRY_MINUTES | OTP validity period | 1 |

## API Documentation

### Auth APIs

#### POST /auth/send-otp
Send OTP to a mobile number.

**Request:**
```json
{
  "mobile": "9876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully.",
  "data": {
    "mobile": "9876543210",
    "otp": "482916",
    "expiresAt": "2024-01-01T00:05:00.000Z"
  }
}
```

#### POST /auth/verify-otp
Verify OTP and receive JWT tokens.

**Request:**
```json
{
  "mobile": "9876543210",
  "otp": "482916"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "...",
      "name": "Admin User",
      "mobile": "9876543210",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /auth/refresh-token
Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### User APIs

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /users/profile | Any logged-in user | Get own profile |
| GET | /users | SUPER_ADMIN, ADMIN, MANAGER | List all users |
| POST | /users | SUPER_ADMIN, ADMIN | Create new user |
| PATCH | /users/:id/role | SUPER_ADMIN only | Update user role |
| DELETE | /users/:id | SUPER_ADMIN only | Delete user |

### Logs APIs

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /logs | SUPER_ADMIN, ADMIN | Get all logs |
| GET | /logs/login | SUPER_ADMIN, ADMIN | Get login logs only |

**Query parameters for logs:**
- `page` (default: 1)
- `limit` (default: 20)
- `action` (filter by log action)
- `status` (SUCCESS/FAILURE)
- `userId` (filter by user)
- `mobile` (filter by mobile)
- `startDate` / `endDate` (date range)

## Database Schema

### Users Collection
| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Auto-generated |
| name | String | User's name (required) |
| mobile | String | 10-digit mobile number (unique, required) |
| role | String | SUPER_ADMIN, ADMIN, MANAGER, USER |
| isActive | Boolean | Account status (default: true) |
| createdAt | Date | Auto-generated |
| updatedAt | Date | Auto-generated |

### OTPs Collection
| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Auto-generated |
| mobile | String | 10-digit mobile number |
| otp | String | 6-digit OTP |
| expiresAt | Date | OTP expiration time |
| isUsed | Boolean | Whether OTP has been used (default: false) |
| attemptCount | Number | Wrong attempt count (default: 0) |
| createdAt | Date | Auto-generated |

### Logs Collection
| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Auto-generated |
| userId | ObjectId | Reference to User (nullable) |
| mobile | String | Mobile number |
| action | String | Log event type (see below) |
| status | String | SUCCESS or FAILURE |
| ipAddress | String | Request IP address |
| userAgent | String | Request User-Agent header |
| message | String | Descriptive message |
| createdAt | Date | Auto-generated |

### Log Events
`OTP_GENERATED`, `OTP_VERIFIED`, `OTP_INVALID`, `OTP_EXPIRED`, `LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCESS_DENIED`, `USER_CREATED`, `ROLE_UPDATED`, `USER_DELETED`

## Sample Users (Seeded)

| Name | Mobile | Role | Active |
|------|--------|------|--------|
| Super Admin User | 9000000001 | SUPER_ADMIN | ✅ |
| Admin User | 9000000002 | ADMIN | ✅ |
| Manager User | 9000000003 | MANAGER | ✅ |
| Regular User | 9000000004 | USER | ✅ |
| Inactive User | 9000000005 | USER | ❌ |

## Sample Logs (Seeded)

| Action | Status | Mobile | Message |
|--------|--------|--------|---------|
| OTP_GENERATED | SUCCESS | 9000000001 | OTP generated for mobile 9000000001 |
| OTP_VERIFIED | SUCCESS | 9000000001 | OTP verified for mobile 9000000001 |
| LOGIN_SUCCESS | SUCCESS | 9000000001 | User logged in successfully |
| OTP_INVALID | FAILURE | 9999999999 | Invalid OTP. 2 attempt(s) remaining. |
| LOGIN_FAILED | FAILURE | 9999999999 | Login failed for mobile 9999999999 |
| OTP_EXPIRED | FAILURE | 9000000006 | OTP has expired |
| USER_CREATED | SUCCESS | 9000000004 | User created by SUPER_ADMIN |
| ROLE_UPDATED | SUCCESS | 9000000003 | Role updated: USER → MANAGER |
| ACCESS_DENIED | FAILURE | 9000000004 | User with role USER attempted GET /users |
| USER_DELETED | SUCCESS | 9000000005 | User deleted by SUPER_ADMIN |

## Validation Rules

- **Mobile number:** Required, exactly 10 digits, numbers only
- **OTP:** Required, 6 digits, expires in 1 minute (configurable), one-time use, max 3 wrong attempts
- **Roles:** SUPER_ADMIN, ADMIN, MANAGER, USER
- **Inactive users:** Cannot log in
- **JWT:** Required for all protected APIs
- **RBAC:** Every protected API checks role permission
- **Access denied:** All denied attempts are logged

## Testing Flow

1. **Send OTP:** `POST /auth/send-otp` with `{ "mobile": "9000000001" }`
2. **Verify OTP:** `POST /auth/verify-otp` with the returned OTP
3. **Use JWT:** Add `Authorization: Bearer <token>` header to all subsequent requests
4. **Test RBAC:** Try accessing routes with different role tokens
5. **View Logs:** `GET /logs` to see all recorded events
