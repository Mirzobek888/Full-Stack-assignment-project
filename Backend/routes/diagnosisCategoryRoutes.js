const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/diagnosisCategoryController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Require authentication for reading categories (user must be logged in)
router.use(authMiddleware);

// GET categories - any logged in user
router.get('/', categoriesController.getCategories);

// POST create category - only admins and clinicians
router.post('/', requireRole(['administrator','clinician']), categoriesController.createCategory);

module.exports = router;
