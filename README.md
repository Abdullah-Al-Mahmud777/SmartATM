# SmartATM – Digital Banking & ATM System

SmartATM is a full-stack ATM and digital banking system built using
Next.js, Express.js and MongoDB.

It simulates real ATM operations like:
- Secure login with card & PIN
- Withdraw and deposit money
- Fund transfer between users
- Transaction history
- Admin dashboard

## Tech Stack
Frontend: Next.js, Tailwind CSS  
Backend: Express.js, Node.js  
Database: MongoDB, Mongoose  
Auth: JWT, bcrypt  

## Features

### User Module
- User registration & login
- Virtual ATM card
- PIN verification
- Withdraw money
- Deposit money
- Balance check
- Mini statement (last 10 transactions)
- Fund transfer
- Change PIN
- Block card

### Admin Module
- Admin login
- View all users
- View all transactions
- Freeze user account
- Reset user PIN
- Block card
- System overview dashboard

## Architecture
Next.js → Express API → MongoDB

## How to run
Backend:
npm install  
npm run dev  

Frontend:
npm install  
npm run dev  
