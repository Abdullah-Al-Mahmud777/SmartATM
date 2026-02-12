
# 🚀 SmartATM – Digital Banking & ATM System

SmartATM is a full-stack **digital banking and ATM simulation system**
built using **Next.js, Express.js, and MongoDB**.

It replicates real-world ATM operations with secure authentication,
transaction management, and an admin control panel.

---

## 📌 Key Features

- Secure login with **Card & PIN**
- Withdraw and deposit money
- Fund transfer between users
- Real-time balance and transaction history
- Admin dashboard for system control

---

## 🛠 Tech Stack

**Frontend**
- Next.js (App Router)
- Tailwind CSS
- React Query

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB
- Mongoose ODM

**Authentication & Security**
- JWT (Access & Refresh Token)
- bcrypt (Password & PIN hashing)

---

## 👤 User Module

Users can perform all core banking operations:

- User registration & login
- Virtual ATM card generation
- Secure PIN verification
- Withdraw money from account
- Deposit money into account
- Check account balance
- Mini statement (last 10 transactions)
- Fund transfer to other users
- Change ATM PIN
- Block ATM card

---

## 🛡 Admin Module

Admins can monitor and control the entire system:

- Admin login
- View all registered users
- View all transactions
- Freeze user accounts
- Reset user PIN
- Block user cards
- System overview dashboard (stats & reports)

---

## 🏗 System Architecture

```text
Next.js (Frontend)
        |
        v
Express.js REST API
        |
        v
MongoDB (Database)
