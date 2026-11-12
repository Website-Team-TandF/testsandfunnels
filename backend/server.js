// backend/server.js
// Tests&Funnels MERN Backend Entry Point

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getDBStatus } = require('./config/db');

// Route imports
const leadRoutes = require('./routes/leadRoutes');
const authRoutes = require('./routes/authRoutes');
const {
  submitLead,
  getLeads,
  updateLead,
  deleteLead,
  exportCSV
} = require('./controllers/leadController');

const app = express();
const PORT = process.env.PORT || 5000;
const ROOT_DIR = path.resolve(__dirname, '..');

// Connect to MongoDB (with auto-fallback buffer)
connectDB();

// Global Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. API Routes
app.use('/api/leads', leadRoutes);
app.use('/api/auth', authRoutes);
app.post('/api/submit', submitLead);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: getDBStatus() ? 'MongoDB Connected' : 'Local Storage Buffer (Active)',
    timestamp: new Date().toISOString()
  });
});

// 3. Serve React Leads Dashboard UI
const dashboardStaticPath = path.join(__dirname, 'public', 'dashboard');
app.use('/dashboard', express.static(dashboardStaticPath));
app.use('/backend/dashboard', express.static(dashboardStaticPath));

// Redirect /backend or /backend/ to the React Dashboard
app.get(['/backend', '/backend/'], (req, res) => {
  res.sendFile(path.join(dashboardStaticPath, 'index.html'));
});

// 4. Serve Website Frontend Static Files (from project root)
app.use(express.static(ROOT_DIR));

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Tests&Funnels MERN Backend Online on Port ${PORT}`);
  console.log(`------------------------------------------------------`);
  console.log(`🌐 Website:         http://localhost:${PORT}/`);
  console.log(`📊 React Dashboard: http://localhost:${PORT}/backend/ (or /dashboard)`);
  console.log(`📬 Lead API:        http://localhost:${PORT}/api/leads/submit`);
  console.log(`🍃 Database:        ${getDBStatus() ? 'MongoDB' : 'Local Storage Buffer'}`);
  console.log(`======================================================\n`);
});

module.exports = app;
