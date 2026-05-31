// ============================================================
// reportRoutes.js - Routes for Report generation
// ============================================================
// Reports are generated for patients and stored for later viewing.
// Only admins and clinicians can access reports.
//
// Registered in server.js under: /api/reports
// Full paths:
//   GET  /api/reports                          → get all reports
//   POST /api/reports/generate/patient/:id     → generate report for a patient
// ============================================================

const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All routes require a valid login token
router.use(authMiddleware);

// All routes require admin or clinician role
router.use(requireRole(['administrator', 'clinician']));

// GET all previously generated reports
router.get('/', reportController.getReports);

// POST generate a new report for a specific patient
// :patientId in the URL is the patient's ID (e.g. PAT-001)
router.post('/generate/patient/:patientId', reportController.generatePatientReport);

module.exports = router;
