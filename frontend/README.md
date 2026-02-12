
1️⃣ User Module Pages
Purpose: User can perform all core banking operations
Page
Features
User Registration & Login (/atm/login)
Card number + PIN login, register new user
Dashboard (/atm/dashboard)
Show account balance, mini statement, quick actions (withdraw, deposit, transfer, change PIN, block card)
Withdraw Money (/atm/withdraw)
Input amount, confirm withdrawal, show updated balance
Deposit Money (/atm/deposit)
Input deposit amount, confirm, show updated balance
Fund Transfer (/atm/transfer)
Transfer to another user, confirm, success/fail message
Transaction History (/atm/transactions)
Table of last 10 transactions (date, type, amount, balance)
Change PIN (/atm/change-pin)
Enter old PIN, new PIN, confirm, validation messages
Block ATM Card (/atm/block-card)
Confirmation popup, block card, show status


2️⃣ Admin Module Pages
Purpose: Admin monitors and controls the system
Page
Features
Admin Login (/admin/login)
Email + password login
Dashboard Overview (/admin/dashboard)
Stats: total users, total transactions, ATM cash, alerts
Users Management (/admin/users)
View all users, freeze account, reset PIN, block card
Transactions Management (/admin/transactions)
View all transactions, filter by user/type/date, transaction details
Reports / Analytics (/admin/reports)
Charts: daily withdrawals/deposits/transfers, top active users, failed login attempts


3️⃣ Home Page
Page
Features
Home Page (/)
Project title, description, User Login button, Admin Login button, Footer

//
app/
 ├─ page.tsx              # Home page
 ├─ layout.tsx            # App layout
 ├─ atm/
 │   ├─ login.tsx
 │   ├─ dashboard.tsx
 │   ├─ withdraw.tsx
 │   ├─ deposit.tsx
 │   ├─ transfer.tsx
 │   ├─ transactionHistory.tsx
 │   ├─ changePin.tsx
 │   └─ blockCard.tsx
 ├─ admin/
 │   ├─ login.tsx
 │   ├─ dashboard.tsx
 │   ├─ users.tsx
 │   ├─ transactions.tsx
 │   └─ reports.tsx
 └─ components/
     ├─ Navbar.tsx
     ├─ Sidebar.tsx
     ├─ CardStat.tsx
     ├─ TransactionTable.tsx
     └─ UserTable.tsx



