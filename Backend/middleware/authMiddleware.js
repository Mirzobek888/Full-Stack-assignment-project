// ============================================================
// authMiddleware.js - Checks if the user is logged in
// ============================================================
// "Middleware" is a function that runs BEFORE the main route
// handler. This one checks if the request has a valid login
// token. If yes, it adds the user info to the request and
// lets the request continue. If no, it blocks it with a 401.
//
// HOW IT WORKS:
// 1. The browser sends a token in the "Authorization" header
//    like this: "Authorization: Bearer abc123xyz"
// 2. We extract the token (the part after "Bearer ")
// 3. We look up the token in our sessions store
// 4. If found, we attach the user object to req.user and call next()
// 5. If not found, we return a 401 Unauthorized error
// ============================================================

const { getUserFromSession } = require('../utils/sessionManager');

function authMiddleware(req, res, next) {
    // Step 1: Read the Authorization header from the incoming request
    const authHeader = req.headers.authorization;

    // Step 2: Make sure the header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No login token provided' });
    }

    // Step 3: Extract the actual token (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    // Step 4: Look up the token in the sessions store
    const user = getUserFromSession(token);

    // Step 5: If the token is invalid or expired, block the request
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token. Please log in again.' });
    }

    // Step 6: Attach the user info and token to the request object
    // Now any route handler can access req.user and req.token
    req.user = user;
    req.token = token;

    // Step 7: Call next() to pass control to the next middleware or route handler
    next();
}

// Export so it can be used in route files
module.exports = authMiddleware;
