// ============================================================
// scheduleRoutes.js - Routes for Doctor Schedule management
// ============================================================
// Registered in server.js under: /api/schedules
// Full paths:
//   GET    /api/schedules        → view all schedules (any logged-in user)
//   POST   /api/schedules        → create schedule    (admin only)
//   PUT    /api/schedules/:id    → update schedule    (admin only)
//   DELETE /api/schedules/:id    → delete schedule    (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All routes require a valid login token
router.use(authMiddleware);

// Any logged-in staff can view the schedule (doctors, receptionists, admins)
router.get('/', scheduleController.getSchedules);

// Get a specific schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// Only administrators can create, update, or delete schedule entries
router.post('/', requireRole(['administrator']), scheduleController.createSchedule);
router.put('/:id', requireRole(['administrator']), scheduleController.updateSchedule);
router.delete('/:id', requireRole(['administrator']), scheduleController.deleteSchedule);

module.exports = router;
