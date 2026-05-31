// ============================================================
// settingsRoutes.js - Routes for System Settings
// ============================================================
// System settings can only be viewed and changed by admins.
//
// Registered in server.js under: /api/settings
// Full paths:
//   GET /api/settings    → read current settings (admin only)
//   PUT /api/settings    → update settings       (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All settings routes require a valid login token AND admin role
router.use(authMiddleware);
router.use(requireRole(['administrator']));

// GET current system settings
router.get('/', settingsController.getSettings);

// PUT update system settings (replaces entire settings object)
router.put('/', settingsController.updateSettings);

module.exports = router;
