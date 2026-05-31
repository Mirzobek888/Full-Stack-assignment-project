// ============================================================
// sessionManager.js - Manages user login sessions
// ============================================================
// When a user logs in, we create a "session token" (a random
// string) and store it together with the user's info in memory.
// The frontend sends this token with every request so we know
// who is making the request.
//
// Note: Sessions are stored in memory (RAM), so they are lost
// when the server restarts. For production, you'd use a database.
// ============================================================

// This object acts like a dictionary: { token: userObject, ... }
// Example: { "abc123": { id: "USR-001", name: "Mirzobek", role: "administrator" } }
const sessions = {};

// -------------------------------------------------------
// CREATE SESSION: Log a user in and return a token
// The token is what the browser stores and sends back
// -------------------------------------------------------
function createSession(user) {
    // Create a random token by combining random numbers and the current time
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Store the user's data under this token key
    sessions[token] = user;

    // Return the token to the login route so it can send it to the browser
    return token;
}

// -------------------------------------------------------
// GET USER FROM SESSION: Look up who owns a given token
// Returns the user object, or null if the token is invalid
// -------------------------------------------------------
function getUserFromSession(token) {
    // Look up the token in our sessions dictionary
    return sessions[token] || null;
}

// -------------------------------------------------------
// DESTROY SESSION: Log a user out by deleting their token
// Returns true if successful, false if the token wasn't found
// -------------------------------------------------------
function destroySession(token) {
    if (sessions[token]) {
        // Delete this token from memory, effectively logging the user out
        delete sessions[token];
        return true;
    }
    return false; // Token didn't exist
}

// Export all three functions
module.exports = {
    createSession,
    getUserFromSession,
    destroySession
};
