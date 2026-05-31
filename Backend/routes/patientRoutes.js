// ============================================================
// patientRoutes.js - Routes for Patient management
// ============================================================
// All routes here require a valid login token (authMiddleware).
// Some routes also require a specific role (requireRole).
//
// Registered in server.js under: /api/patients
// Full paths:
//   GET    /api/patients        → get all patients (any logged-in user)
//   GET    /api/patients/:id    → get one patient  (any logged-in user)
//   POST   /api/patients        → create patient   (admin, receptionist)
//   PUT    /api/patients/:id    → update patient   (admin, clinician)
//   DELETE /api/patients/:id    → delete patient   (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Apply authMiddleware to ALL routes below this line
// This means every request to /api/patients/... must have a valid token
router.use(authMiddleware);

// GET all patients - any logged-in user can see the list
router.get('/', patientController.getPatients);

// GET one patient by ID - any logged-in user
router.get('/:id', patientController.getPatientById);

// POST create patient - only admins and receptionists
router.post('/', requireRole(['administrator', 'receptionist']), patientController.createPatient);

// PUT update patient - only admins and clinicians
router.put('/:id', requireRole(['administrator', 'clinician']), patientController.updatePatient);

// DELETE patient - only admins
router.delete('/:id', requireRole(['administrator']), patientController.deletePatient);

module.exports = router;
