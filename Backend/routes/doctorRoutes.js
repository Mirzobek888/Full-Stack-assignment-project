// ============================================================
// doctorRoutes.js - Routes for Doctor management
// ============================================================
// Registered in server.js under: /api/doctors
// Full paths:
//   GET    /api/doctors        → get all doctors (any logged-in user)
//   GET    /api/doctors/:id    → get one doctor  (any logged-in user)
//   POST   /api/doctors        → create doctor   (admin only)
//   PUT    /api/doctors/:id    → update doctor   (admin only)
//   DELETE /api/doctors/:id    → delete doctor   (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All doctor routes require a valid login token
router.use(authMiddleware);

// Any logged-in user can view doctors
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);

// Only administrators can add, edit, or remove doctors
router.post('/', requireRole(['administrator']), doctorController.createDoctor);
router.put('/:id', requireRole(['administrator']), doctorController.updateDoctor);
router.delete('/:id', requireRole(['administrator']), doctorController.deleteDoctor);

module.exports = router;
