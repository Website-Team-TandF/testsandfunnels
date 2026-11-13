/* server.js
   Express entry point for the CRM API. In development the React dashboard runs
   on its own Vite server and proxies /api here. In production, if a built
   dashboard exists at frontend/dist, this server also serves it, so one Node
   process runs the whole app. */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB, isConnected } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '2mb' }));

/* API routes */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.get('/api/health', (req, res) => res.json({ ok: true, db: isConnected() ? 'connected' : 'disconnected' }));

/* Serve the built dashboard in production (skipped during dev, when it is absent) */
const dist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log('CRM API listening on http://localhost:' + PORT);
});
