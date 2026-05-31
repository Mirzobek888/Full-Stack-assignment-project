// ============================================================
// auditRoutes.js - Routes for Audit Log viewing
// ============================================================
// Only administrators can view the audit log history.
//
// Registered in server.js under: /api/audit-logs
// Full paths:
//   GET /api/audit-logs    → get all audit logs (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All audit log routes require a valid login token AND admin role
router.use(authMiddleware);
router.use(requireRole(['administrator']));

// GET all audit log entries (sorted newest first)
router.get('/', auditController.getAuditLogs);

module.exports = router;
