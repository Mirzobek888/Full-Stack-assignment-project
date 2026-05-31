// ============================================================
// userRoutes.js - Routes for System User management
// ============================================================
// These routes are for managing staff accounts in the system.
// ONLY administrators can access any of these routes.
//
// Registered in server.js under: /api/users
// Full paths:
//   GET    /api/users        → get all users (admin only)
//   POST   /api/users        → create user   (admin only)
//   PUT    /api/users/:id    → update user   (admin only)
//   DELETE /api/users/:id    → delete user   (admin only)
// ============================================================

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Step 1: All requests must have a valid login token
router.use(authMiddleware);

// Step 2: All requests must be from an administrator
// By putting requireRole here, it applies to ALL routes below
router.use(requireRole(['administrator']));

// CRUD routes for user management
router.get('/', userController.getUsers);          // List all users
router.post('/', userController.createUser);       // Create a new user
router.put('/:id', userController.updateUser);    // Update an existing user
router.delete('/:id', userController.deleteUser); // Delete a user

module.exports = router;
