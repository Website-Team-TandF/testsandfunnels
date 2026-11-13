/* db.js
   Connects to MongoDB (local by default). The server still starts if the DB is
   down, so you get a clear message instead of a crash. Fix by starting a local
   MongoDB (`mongod`) or setting MONGODB_URI in backend/.env. */
const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/testsandfunnels';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    connected = true;
    console.log('MongoDB connected: ' + mongoose.connection.host + '/' + mongoose.connection.name);
  } catch (err) {
    connected = false;
    console.warn('MongoDB connection failed: ' + err.message);
    console.warn('Start a local MongoDB (mongod) or set MONGODB_URI in backend/.env');
  }
}

/* True only when a live connection exists; used by /api/health. */
const isConnected = () => connected && mongoose.connection.readyState === 1;

module.exports = { connectDB, isConnected };
