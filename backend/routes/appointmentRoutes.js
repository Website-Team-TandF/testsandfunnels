/* appointmentRoutes.js — /api/appointments (all admin-only) */
const router = require('express').Router();
const c = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

router.post('/', auth, c.createAppointment);
router.get('/', auth, c.getAppointments);
router.put('/:id', auth, c.updateAppointment);
router.delete('/:id', auth, c.deleteAppointment);

module.exports = router;
