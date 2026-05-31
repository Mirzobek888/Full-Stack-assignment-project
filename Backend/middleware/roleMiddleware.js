// ============================================================
// roleMiddleware.js - Checks if the user has the right role
// ============================================================
// Some routes are only allowed for certain roles.
// For example: only administrators can delete users.
//
// This middleware is used AFTER authMiddleware, so req.user
// is already set. It checks if the user's role is in the
// list of allowed roles for that route.
//
// HOW TO USE IT IN A ROUTE FILE:
//   const requireRole = require('../middleware/roleMiddleware');
//   router.delete('/users/:id', authMiddleware, requireRole(['administrator']), handler);
//
// If the user's role is NOT in allowedRoles, we return 403 Forbidden
// and log the failed attempt in the audit log.
// ============================================================

const { logAction } = require('../utils/auditLogger');

// requireRole takes an array of allowed role names
// and returns a middleware function
function requireRole(allowedRoles) {

    // This is the actual middleware function Express will call
    return function checkRole(req, res, next) {

        // Step 1: Make sure the user is attached (authMiddleware ran first)
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Unauthorized: You must be logged in.' });
        }

        // Step 2: Check if the user's role is in the allowed list
        const userHasPermission = allowedRoles.includes(req.user.role);

        if (userHasPermission) {
            // Role is allowed — let the request continue to the route handler
            next();
        } else {
            // Role is NOT allowed — log the attempt and block the request

            // Log this failed access attempt in the audit log
            logAction(
                req.user.name,
                req.user.role,
                'Permission Redirect',
                'System',
                `Attempted to access forbidden route: ${req.originalUrl}`,
                req.ip
            );

            // Send 403 Forbidden response
            return res.status(403).json({
                error: `Forbidden: Your role (${req.user.role}) cannot access this resource.`
            });
        }
    };
}

// Export so route files can use it
module.exports = requireRole;
