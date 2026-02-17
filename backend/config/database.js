const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shuvo:1234@cluster0.bfd2hb1.mongodb.net/smart_atm_db?retryWrites=true&w=majority";
    
    // Remove deprecated options - Mongoose 6+ handles these automatically
    await mongoose.connect(MONGO_URI);
    
    console.log("✅ MongoDB Atlas Connected Successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process with failure
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

module.exports = connectDB;
