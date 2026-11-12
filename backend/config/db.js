// backend/config/db.js
// MongoDB connection with graceful connection handling

const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testsandfunnels';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    isConnected = false;
    console.warn(`\n⚠️  MongoDB connection warning: ${err.message}`);
    console.warn(`👉 To connect a database:`);
    console.warn(`   - Start your local MongoDB server (mongod), OR`);
    console.warn(`   - Paste your MongoDB Atlas URI in backend/.env (MONGODB_URI=mongodb+srv://...)\n`);
    console.warn(`⚡ Operating with local storage buffer so the API & Dashboard stay online!\n`);
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };

