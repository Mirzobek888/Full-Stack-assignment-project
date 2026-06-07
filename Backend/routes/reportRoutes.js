// reportRoutes.js - Routes for the Report API
// =============================================
// These routes handle all HTTP requests related to reports.
// The path prefix is /api/reports (defined in server.js)

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All report routes require authentication
router.use(authMiddleware);

// GET /api/reports
// Get all reports
router.get('/', reportController.getReports);

// GET /api/reports/patient/:patientId
// Get all reports for a specific patient
router.get('/patient/:patientId', reportController.getPatientReports);

// POST /api/reports/patient/:patientId
// Generate a new report for a patient (clinician or admin only)
router.post('/patient/:patientId', requireRole(['administrator', 'clinician']), reportController.generatePatientReport);

// DELETE /api/reports/:reportId
// Delete a report (clinician or admin only)
router.delete('/:reportId', requireRole(['administrator', 'clinician']), reportController.deleteReport);

module.exports = router;
