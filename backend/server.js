const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');

const app = express();

// Connect to Database (Vercel optimization)
connectDB();

// Middleware
app.use(cors({
  // আপনার ফ্রন্টএন্ড লিঙ্ক এখানে দিন অথবা আপাতত '*' দিন সব Allow করার জন্য
  origin: true, // এটি রিকোয়েস্ট যেখান থেকে আসছে তাকেই অনুমতি দিবে (টেস্টিংয়ের জন্য সহজ)
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartATM Backend API', 
    status: 'Running',
    version: '1.0.0'
  });
});

// Start Server (Local-এর জন্য)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Vercel এর জন্য এক্সপোর্ট
module.exports = app;