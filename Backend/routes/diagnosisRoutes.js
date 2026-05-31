// ============================================================
// diagnosisRoutes.js - Routes for Diagnosis management
// ============================================================
// Registered in server.js under: /api/diagnoses
// Full paths:
//   GET    /api/diagnoses        → get all diagnoses (admin, clinician)
//   GET    /api/diagnoses/:id    → get one diagnosis  (admin, clinician)
//   POST   /api/diagnoses        → create diagnosis   (admin, clinician)
//   PUT    /api/diagnoses/:id    → update diagnosis   (admin, clinician)
//   DELETE /api/diagnoses/:id    → delete diagnosis   (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const diagnosisController = require('../controllers/diagnosisController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All diagnosis routes require a valid login token
router.use(authMiddleware);

// Both admins and clinicians can view, create, and update diagnoses
router.get('/', requireRole(['administrator', 'clinician']), diagnosisController.getDiagnoses);
router.get('/:id', requireRole(['administrator', 'clinician']), diagnosisController.getDiagnosisById);
router.post('/', requireRole(['administrator', 'clinician']), diagnosisController.createDiagnosis);
router.put('/:id', requireRole(['administrator', 'clinician']), diagnosisController.updateDiagnosis);

// Only administrators can permanently delete a diagnosis
router.delete('/:id', requireRole(['administrator']), diagnosisController.deleteDiagnosis);

module.exports = router;
