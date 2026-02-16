const express = require('express');
const mongoose = require('mongoose');
const app = express();

// এখানে আপনার ডাটাবেস নাম 'smart_atm_db' সেট করে দেওয়া হয়েছে
const MONGO_URI = "mongodb+srv://shuvo:1234@cluster0.bfd2hb1.mongodb.net/smart_atm_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected!"))
    .catch(err => console.log("❌ Connection Error:", err));

// একটি সিম্পল মডেল তৈরি করা
const User = mongoose.model('User', { name: String, balance: Number });

// ২. এই রুটটি কল করলেই ডাটাবেস তৈরি হবে
app.get('/create-db', async (req, res) => {
    try {
        const testUser = new User({ name: "Shuvo", balance: 1000 });
        await testUser.save(); // এই লাইনটি আসল কাজ করবে
        res.send("<h1>অভিনন্দন!</h1><p>ডাটাবেস তৈরি হয়েছে এবং একটি ডাটা সেভ হয়েছে। এখন Atlas-এ চেক করুন।</p>");
    } catch (err) {
        res.status(500).send("ভুল হয়েছে: " + err.message);
    }
});

app.listen(5000, () => console.log("🚀 সার্ভার চলছে http://localhost:5000 এ"));