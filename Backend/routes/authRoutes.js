// ============================================================
// authRoutes.js - Routes for login, get current user, logout
// ============================================================
// These routes are public (no auth needed for login).
// The /me and /logout routes require a valid login token.
//
// Registered in server.js under: /api/auth
// So the full paths are:
//   POST /api/auth/login   → login
//   GET  /api/auth/me      → get current user
//   POST /api/auth/logout  → logout
// ============================================================

const express = require('express');
const router = express.Router();

// Import the handler functions from the controller
const authController = require('../controllers/authController');

// Import the authentication middleware (checks login token)
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/login - Anyone can try to log in (no token needed)
router.post('/login', authController.login);


// GET /api/auth/me - Must be logged in to get your own user info
router.get('/me', authMiddleware, authController.getMe);

// POST /api/auth/logout - Must be logged in to log out
router.post('/logout', authMiddleware, authController.logout);

// Export the router so server.js can use it
module.exports = router;
