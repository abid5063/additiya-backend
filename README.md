# Additiya Backend API

A Node.js Express API with user authentication using MongoDB.

## Features

- User Registration and Login
- JWT Authentication
- Password hashing with bcryptjs
- Input validation
- Rate limiting
- CORS enabled
- Security headers with Helmet
- Environment configuration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd additiya-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/additiya-backend
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication Routes

#### Register User
- **URL**: `POST /api/auth/register`
- **Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St, City, Country",
  "phone": "+1234567890",
  "password": "password123"
}
```

#### Login User
- **URL**: `POST /api/auth/login`
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile (Protected)
- **URL**: `GET /api/auth/profile`
- **Headers**: 
```
Authorization: Bearer <your-jwt-token>
```

### Health Check
- **URL**: `GET /api/health`

### Root Route
- **URL**: `GET /`

## User Model

The User model includes the following fields:

- `name` (String, required): User's full name
- `email` (String, required, unique): User's email address
- `address` (String, required): User's address
- `phone` (String, required): User's phone number
- `password` (String, required): User's password (hashed)
- `createdAt` (Date): Account creation timestamp
- `updatedAt` (Date): Last update timestamp

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet
- Input validation and sanitization

## Project Structure

```
src/
├── config/
│   └── database.js        # Database connection
├── middleware/
│   └── auth.js           # Authentication middleware
├── models/
│   └── User.js           # User model
├── routes/
│   └── auth.js           # Authentication routes
└── server.js             # Main server file
```

## Error Handling

The API includes comprehensive error handling:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Testing the API

You can test the API using tools like Postman, Insomnia, or curl:

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "phone": "+1234567890",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get profile (use the token from login response):
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/additiya-backend |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| RATE_LIMIT_WINDOW_MS | Rate limit window in milliseconds | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## License

MIT