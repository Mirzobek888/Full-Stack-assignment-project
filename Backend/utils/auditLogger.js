// ============================================================
// auditLogger.js - Records every important action in the system
// ============================================================
// Whenever a user does something important (login, add a patient,
// delete a doctor, etc.), we save a log entry. This helps admins
// see a full history of what happened and who did it.
// ============================================================

const { createRecord } = require('./fileDb');     // To save the log entry
const { generateId } = require('./idGenerator'); // To give each log a unique ID

// -------------------------------------------------------
// LOG ACTION: Save one audit log entry to auditLogs.json
//
// Parameters:
//   user      - The name of the user who did the action (e.g. "Mirzobek Tursunov")
//   role      - Their role (e.g. "administrator")
//   action    - What they did (e.g. "Login", "Created", "Deleted")
//   entity    - What they acted on (e.g. "Patient", "Doctor", "System")
//   details   - A description of the action (e.g. "Registered patient John Doe")
//   ipDevice  - The IP address of the device that made the request
// -------------------------------------------------------
function logAction(user, role, action, entity, details, ipDevice = 'Unknown') {
    // Build the log entry object with all the information
    const logEntry = {
        id: generateId('LOG'),           // Unique ID for this log entry
        timestamp: new Date().toISOString(), // Current date and time in ISO format
        user: user || 'Unknown',         // Who did it
        role: role || 'Unknown',         // Their role
        action: action,                  // What action they took
        entity: entity,                  // What they acted on
        details: details,                // More detail about the action
        ipDevice: ipDevice               // The IP address of the request
    };

    // Save the log entry by adding it to the auditLogs.json file
    createRecord('auditLogs.json', logEntry);
}

// Export the function so other files (like controllers) can use it
module.exports = { logAction };
