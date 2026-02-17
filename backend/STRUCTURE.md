# Backend Structure Documentation

## 📁 Folder Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic (login, register, profile)
│   └── transactionController.js  # Transaction logic (withdraw, deposit, transfer)
├── middleware/
│   └── authMiddleware.js    # JWT verification & authentication
├── models/
│   ├── User.js              # User schema & model
│   └── Transaction.js       # Transaction schema & model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── transactions.js      # Transaction routes
├── .env                     # Environment variables
├── server.js                # Main server file
├── package.json             # Dependencies
└── README.md                # API documentation
```

## 🔧 How It Works

### 1. **Server.js** (Main Entry Point)
- Connects to MongoDB database
- Sets up middleware (CORS, JSON parser)
- Registers routes
- Starts the Express server
- Handles errors

### 2. **Config/database.js**
- Contains MongoDB connection logic
- Handles connection events (connected, disconnected, error)
- Uses environment variables for connection string

### 3. **Models/** (Database Schemas)

#### User.js
- Defines user data structure
- Fields: cardNumber, pin, name, email, phone, balance, etc.
- Methods: 
  - `comparePin()` - Verify PIN
  - Pre-save hook to hash PIN with bcrypt

#### Transaction.js
- Defines transaction data structure
- Fields: transactionId, userId, type, amount, status, etc.
- Tracks all user transactions

### 4. **Controllers/** (Business Logic)

#### authController.js
Handles all authentication operations:
- `login()` - User login with card number & PIN
- `register()` - New user registration
- `getProfile()` - Get user profile data
- `updateProfile()` - Update user information
- `changePin()` - Change user PIN

#### transactionController.js
Handles all transaction operations:
- `withdraw()` - Withdraw money from account
- `deposit()` - Deposit money to account
- `transfer()` - Transfer money to another account
- `getHistory()` - Get transaction history
- `getBalance()` - Get current balance

### 5. **Middleware/** (Request Processing)

#### authMiddleware.js
- `verifyToken()` - Verifies JWT token from request header
- Extracts user ID from token
- Adds userId to request object
- Protects routes that require authentication

### 6. **Routes/** (API Endpoints)

#### auth.js
```javascript
POST   /api/auth/login          // Login (Public)
POST   /api/auth/register       // Register (Public)
GET    /api/auth/profile        // Get profile (Protected)
PUT    /api/auth/profile        // Update profile (Protected)
POST   /api/auth/change-pin     // Change PIN (Protected)
```

#### transactions.js
```javascript
POST   /api/transactions/withdraw   // Withdraw money (Protected)
POST   /api/transactions/deposit    // Deposit money (Protected)
POST   /api/transactions/transfer   // Transfer money (Protected)
GET    /api/transactions/history    // Get history (Protected)
GET    /api/transactions/balance    // Get balance (Protected)
```

## 🔐 Authentication Flow

1. **User Registration:**
   ```
   Client → POST /api/auth/register → authController.register()
   → Create user in DB → Hash PIN → Generate JWT token → Return token
   ```

2. **User Login:**
   ```
   Client → POST /api/auth/login → authController.login()
   → Find user → Verify PIN → Generate JWT token → Return token
   ```

3. **Protected Route Access:**
   ```
   Client (with token) → Protected Route → authMiddleware.verifyToken()
   → Verify token → Extract userId → Controller → Response
   ```

## 💳 Transaction Flow

1. **Withdraw Money:**
   ```
   Client → POST /api/transactions/withdraw → verifyToken middleware
   → transactionController.withdraw() → Check balance → Update balance
   → Create transaction record → Return response
   ```

2. **Transfer Money:**
   ```
   Client → POST /api/transactions/transfer → verifyToken middleware
   → transactionController.transfer() → Find recipient → Check balance
   → Update both balances → Create transaction records → Return response
   ```

## 🔑 Key Concepts

### Controllers
- Handle business logic
- Process requests
- Interact with database
- Return responses
- Separated from routes for better organization

### Middleware
- Functions that run before controllers
- Can modify request/response
- Used for authentication, validation, logging
- Can stop request chain or pass to next middleware

### Models
- Define data structure
- Interact with MongoDB
- Include validation rules
- Can have custom methods

### Routes
- Define API endpoints
- Connect URLs to controllers
- Apply middleware to routes
- Organize related endpoints

## 🚀 Starting the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

## 📝 Environment Variables

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

## 🛡️ Security Features

1. **JWT Authentication** - Token-based auth
2. **Bcrypt Password Hashing** - Secure PIN storage
3. **Input Validation** - Prevent invalid data
4. **Error Handling** - Secure error messages
5. **CORS Configuration** - Control access origins

## 📊 Database Collections

1. **users** - Stores user information
2. **transactions** - Stores all transactions

## 🔄 Request/Response Flow

```
Client Request
    ↓
Express Server (server.js)
    ↓
Middleware (CORS, JSON parser, Logger)
    ↓
Route Handler (routes/auth.js or routes/transactions.js)
    ↓
Authentication Middleware (if protected route)
    ↓
Controller (authController or transactionController)
    ↓
Model (User or Transaction)
    ↓
MongoDB Database
    ↓
Response back to Client
```

This structure follows MVC (Model-View-Controller) pattern for better code organization and maintainability!
