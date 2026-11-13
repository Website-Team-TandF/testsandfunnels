/* leadRoutes.js — /api/leads
   POST is public (website forms + dashboard create); the rest need a token. */
const router = require('express').Router();
const c = require('../controllers/leadController');
const auth = require('../middleware/auth');

router.post('/', c.createLead);
router.get('/', auth, c.getLeads);
router.put('/:id', auth, c.updateLead);
router.delete('/:id', auth, c.deleteLead);

module.exports = router;
