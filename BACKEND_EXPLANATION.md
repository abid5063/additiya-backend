# Additiya Backend - Detailed Technical Explanation

## 🏗️ Architecture Overview

This Node.js backend follows a **RESTful API architecture** using the **MVC (Model-View-Controller)** pattern, built with modern JavaScript (ES6+ modules) and designed for scalability and security.

### Technology Stack
- **Runtime**: Node.js with ES6 Modules
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs hashing
- **Development**: Nodemon for auto-restart

## 📁 Project Structure Analysis

```
additiya-backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection logic
│   ├── middleware/
│   │   └── auth.js          # JWT authentication & authorization
│   ├── models/
│   │   └── User.js          # User data model with validations
│   ├── routes/
│   │   └── auth.js          # Authentication API endpoints
│   └── server.js            # Main application entry point
├── .env                     # Environment variables (sensitive data)
├── .gitignore              # Git ignore patterns
├── package.json            # Project dependencies and scripts
└── README.md               # Basic documentation
```

## 🔧 Core Components Breakdown

### 1. **Server Configuration (server.js)**

The main server file orchestrates the entire application:

```javascript
// Key Features Implemented:
- ES6 Module System (import/export)
- Environment Configuration (dotenv)
- Database Connection Initialization
- Security Middleware Stack
- CORS Configuration for Cross-Origin Requests
- Rate Limiting (100 requests/15 minutes)
- Request Parsing (JSON & URL-encoded)
- Route Mounting
- Global Error Handling
- Graceful Server Shutdown
```

**Security Middleware Stack:**
1. **Helmet**: Sets security HTTP headers
2. **CORS**: Cross-Origin Resource Sharing (allows all origins in development)
3. **Rate Limiting**: Prevents brute-force attacks
4. **Body Parsing**: JSON payload parsing with 10MB limit

**Server Binding:**
- Listens on `0.0.0.0` (all network interfaces)
- Enables access from other devices on the network
- Environment-based port configuration (default: 3000)

### 2. **Database Configuration (config/database.js)**

**MongoDB Connection Strategy:**
```javascript
// Features:
- Async/await pattern for modern Promise handling
- MongoDB Atlas cloud database integration
- Connection error handling with process termination
- Connection success logging with host information
```

**Database Details:**
- **Provider**: MongoDB Atlas (Cloud)
- **Connection**: Via Mongoose ODM
- **Database Name**: AGROLINK
- **Retry Logic**: Built into Mongoose connection

### 3. **User Model (models/User.js)**

**Schema Design:**
```javascript
// Fields with Validation:
name: String (required, max 100 chars, trimmed)
email: String (required, unique, lowercase, regex validated)
address: String (required, max 200 chars, trimmed)
phone: String (required, flexible regex: 8-15 chars, supports international formats)
password: String (required, min 6 chars, excluded from queries by default)
timestamps: Auto-generated createdAt & updatedAt
```

**Security Features:**
1. **Password Hashing**: bcrypt with salt rounds of 12
2. **Pre-save Middleware**: Automatically hashes passwords before database storage
3. **Password Comparison**: Instance method for secure password verification
4. **JSON Serialization**: Automatically removes password from API responses

**Validation Rules:**
- **Email**: RFC-compliant regex pattern
- **Phone**: Flexible international format support (+, spaces, hyphens, parentheses)
- **Password**: Minimum 6 characters (hashed with bcrypt)

### 4. **Authentication Middleware (middleware/auth.js)**

**JWT Protection Strategy:**
```javascript
// Token Verification Process:
1. Extract Bearer token from Authorization header
2. Verify token signature using JWT_SECRET
3. Decode payload to get user ID
4. Fetch user from database
5. Attach user data to request object
6. Grant access to protected routes
```

**Security Measures:**
- **Token Validation**: Comprehensive JWT verification
- **User Existence Check**: Ensures token belongs to valid user
- **Error Handling**: Detailed error messages for debugging
- **Authorization Helper**: Role-based access control (future-ready)

### 5. **Authentication Routes (routes/auth.js)**

**API Endpoints Implementation:**

#### **POST /api/auth/register**
```javascript
// Registration Process:
1. Extract user data from request body
2. Check if email already exists (prevent duplicates)
3. Create new user (triggers password hashing)
4. Generate JWT token
5. Return user data + token
```

**Response Format:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object without password */ },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### **POST /api/auth/login**
```javascript
// Login Process:
1. Validate email & password presence
2. Find user by email (include password field)
3. Compare provided password with hashed password
4. Generate JWT token if credentials valid
5. Return user data + token (exclude password)
```

#### **GET /api/auth/profile** (Protected)
```javascript
// Profile Access:
1. JWT middleware validates token
2. Extract user ID from token
3. Fetch fresh user data from database
4. Return current user profile
```

## 🔐 Security Implementation

### **Password Security**
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Pre-save Hook**: Automatic hashing before database storage
- **Comparison Method**: Secure bcrypt.compare() for verification
- **Storage**: Never store plain text passwords

### **JWT Authentication**
- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: 7 days (configurable)
- **Secret**: Environment-based secret key
- **Payload**: Contains user ID for stateless authentication

### **API Security**
- **Rate Limiting**: 100 requests per 15-minute window per IP
- **CORS**: Configured for development (allows all origins)
- **Helmet**: Sets security headers (XSS protection, content type sniffing, etc.)
- **Input Validation**: Mongoose schema validation + custom regex patterns

### **Error Handling**
- **Validation Errors**: Detailed field-level error messages
- **Authentication Errors**: Standardized 401 responses
- **Database Errors**: Mongoose error handling with user-friendly messages
- **Global Error Handler**: Catches unhandled errors and formats responses

## 🚀 Development Features

### **Hot Reloading**
- **Nodemon**: Automatic server restart on file changes
- **ES6 Modules**: Modern import/export syntax
- **Environment Separation**: Development vs. production configurations

### **API Testing Ready**
- **CORS Enabled**: Frontend integration ready
- **Consistent Responses**: Standardized JSON response format
- **Health Check**: `/api/health` endpoint for monitoring
- **Documentation**: Comprehensive API documentation

## 🌐 Network Configuration

### **Cross-Device Access**
- **Server Binding**: `0.0.0.0` allows LAN access
- **CORS Policy**: Permissive in development mode
- **Network Discovery**: Server logs show local and network URLs

### **Environment Variables**
```env
PORT=3000                          # Server port
NODE_ENV=development               # Environment mode
MONGO_URI=mongodb+srv://...        # MongoDB Atlas connection
JWT_SECRET=your-secret-key         # JWT signing secret
JWT_EXPIRE=7d                      # Token expiration
RATE_LIMIT_WINDOW_MS=900000        # Rate limit window
RATE_LIMIT_MAX_REQUESTS=100        # Max requests per window
```

## 📊 Data Flow

### **Registration Flow**
```
Client Request → Validation → Email Uniqueness Check → Password Hashing → 
Database Storage → JWT Generation → Response with Token
```

### **Login Flow**
```
Client Request → Input Validation → User Lookup → Password Verification → 
JWT Generation → Response with Token
```

### **Protected Route Access**
```
Client Request → JWT Extraction → Token Verification → User Validation → 
Route Handler Execution → Response
```

## 🔧 Scalability Considerations

### **Database**
- **Mongoose ODM**: Provides schema validation and middleware
- **MongoDB Atlas**: Cloud-hosted, auto-scaling database
- **Connection Pooling**: Built into Mongoose driver

### **Authentication**
- **Stateless JWT**: No server-side session storage required
- **Token-based**: Horizontally scalable architecture
- **Middleware Pattern**: Reusable across routes

### **Performance**
- **bcrypt Optimization**: Balanced security (12 rounds) vs. performance
- **Rate Limiting**: Prevents abuse and ensures fair resource usage
- **Error Handling**: Prevents crashes and maintains availability

## 🚦 Production Readiness

### **Security Checklist**
- ✅ Password hashing implemented
- ✅ JWT authentication configured
- ✅ Rate limiting enabled
- ✅ Security headers set
- ✅ Input validation implemented
- ⚠️ JWT secret needs production value
- ⚠️ CORS needs production restrictions

### **Deployment Considerations**
1. **Environment Variables**: Update for production values
2. **Database**: Ensure MongoDB Atlas production cluster
3. **CORS**: Restrict to production domains
4. **Rate Limiting**: Adjust based on expected traffic
5. **Monitoring**: Add logging and health checks
6. **SSL**: Implement HTTPS in production

## 🧪 Testing Strategy

The backend is designed for easy testing:
- **Modular Structure**: Each component can be unit tested
- **Middleware Pattern**: Authentication logic is isolated
- **Consistent Responses**: Predictable API contract
- **Error Handling**: Comprehensive error scenarios covered

This backend provides a robust foundation for user authentication and can be easily extended with additional features like user roles, password reset, email verification, and more complex business logic.