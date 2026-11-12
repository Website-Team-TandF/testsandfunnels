// backend/routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  submitLead,
  getLeads,
  getLeadStats,
  updateLead,
  deleteLead,
  exportCSV
} = require('../controllers/leadController');

// Public lead submission
router.post('/submit', submitLead);

// Protected routes (Admin Dashboard)
router.get('/', authMiddleware, getLeads);
router.get('/stats', authMiddleware, getLeadStats);
router.get('/export', authMiddleware, exportCSV);
router.put('/:id', authMiddleware, updateLead);
router.delete('/:id', authMiddleware, deleteLead);

module.exports = router;
