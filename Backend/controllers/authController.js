// ============================================================
// authController.js - Handles Login, Get Current User, Logout
// ============================================================
// This file contains the functions that run when someone hits
// the /api/auth routes. Each function handles one specific task.
// ============================================================

const { readData } = require('../utils/fileDb');
const { createSession, destroySession } = require('../utils/sessionManager');
const { logAction } = require('../utils/auditLogger');
const { verifyPassword } = require('../utils/password');

// -------------------------------------------------------
// LOGIN: POST /api/auth/login
// The user sends their username and password.
// We check if they match a record in users.json.
// If yes, we create a session and return a token.
// -------------------------------------------------------
function login(req, res) {
    // Step 1: Get username and password from the request body
    const { username, password } = req.body;

    // Step 2: Make sure both fields were provided
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Step 3: Load all users from the JSON file
    const users = readData('users.json');

    // Step 4: Find an Active user with this username, then verify the password hash
    const matchedUser = users.find(
        u => u.username === username && u.status === 'Active'
    );

    // Step 5: Reject if no such user or the password does not match the stored hash
    if (!matchedUser || !verifyPassword(password, matchedUser.password)) {
        return res.status(401).json({ error: 'Invalid credentials or account is inactive.' });
    }

    // Step 6: Remove the password field before sending user data to the browser
    // We use destructuring to separate password from the rest of the user fields
    const { password: _removedPassword, ...userWithoutPassword } = matchedUser;

    // Step 7: Create a session token for this user
    const token = createSession(userWithoutPassword);

    // Step 8: Write this login event to the audit log
    logAction(matchedUser.name, matchedUser.role, 'Login', 'System', 'User logged in', req.ip);

    // Step 9: Send the token and user info back to the browser
    res.json({
        message: 'Login successful',
        token: token,
        user: userWithoutPassword
    });
}

// -------------------------------------------------------
// GET ME: GET /api/auth/me
// Returns the currently logged-in user's info.
// The authMiddleware already attached user to req.user.
// -------------------------------------------------------
function getMe(req, res) {
    // Just send back the user object from the session
    res.json({ user: req.user });
}

// -------------------------------------------------------
// LOGOUT: POST /api/auth/logout
// Deletes the session token so the user is logged out.
// -------------------------------------------------------
function logout(req, res) {
    // Get the token from the request (set by authMiddleware)
    const token = req.token;

    if (token) {
        // Delete the session from memory
        destroySession(token);

        // Write this logout event to the audit log
        logAction(req.user.name, req.user.role, 'Logout', 'System', 'User logged out', req.ip);
    }

    res.json({ message: 'Logged out successfully.' });
}

// Export the three functions
module.exports = { login, getMe, logout };
