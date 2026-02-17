# SmartATM Backend API

Complete authentication and transaction system for SmartATM application.

## Features

- User Registration & Login with JWT authentication
- Secure PIN hashing with bcrypt
- Transaction management (Withdraw, Deposit, Transfer)
- User profile management
- MongoDB Atlas integration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires token)

### Transactions
- `POST /api/transactions/withdraw` - Withdraw money (requires token)
- `POST /api/transactions/deposit` - Deposit money (requires token)
- `GET /api/transactions/history` - Get transaction history (requires token)

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables in `.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Usage Examples

### Register User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "cardNumber": "1234567890123456",
  "pin": "1234",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01712345678",
  "accountNumber": "1234567890"
}
```

### Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "cardNumber": "1234567890123456",
  "pin": "1234"
}
```

### Withdraw Money
```bash
POST http://localhost:5000/api/transactions/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 5000
}
```

## Database Schema

### User Model
- cardNumber (String, unique)
- pin (String, hashed)
- name (String)
- accountNumber (String, unique)
- balance (Number)
- email (String, unique)
- phone (String)
- status (Active/Frozen/Blocked)
- cardStatus (Active/Blocked)

### Transaction Model
- transactionId (String, unique)
- userId (ObjectId, ref: User)
- type (Withdraw/Deposit/Transfer/Payment)
- amount (Number)
- status (Completed/Pending/Failed)
- balanceAfter (Number)
- createdAt (Date)

## Security Features

- JWT token-based authentication
- Bcrypt password hashing
- Account status validation
- Card status validation
- Transaction limits

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- CORS enabled
