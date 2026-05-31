// ============================================================
// auditController.js - Handles reading the Audit Logs
// ============================================================
// The audit log is a record of everything that happened in the
// system — who logged in, who added a patient, etc.
// Only admins can view this. These functions run when hitting
// the /api/audit-logs routes.
// ============================================================

const { readData } = require('../utils/fileDb');

// -------------------------------------------------------
// GET ALL AUDIT LOGS: GET /api/audit-logs
// Returns all log entries, sorted newest first
// -------------------------------------------------------
function getAuditLogs(req, res) {
    // Read all log entries from auditLogs.json
    const logs = readData('auditLogs.json');

    // Sort the logs so the newest ones appear at the top
    // new Date(b.timestamp) - new Date(a.timestamp) puts larger (newer) dates first
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(logs);
}

module.exports = { getAuditLogs };
