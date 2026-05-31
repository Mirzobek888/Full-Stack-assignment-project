// ============================================================
// settingsController.js - Handles reading and saving Settings
// ============================================================
// System settings (like clinic name, notification prefs, etc.)
// are stored as a single JSON object (not an array) in settings.json
// These functions run when hitting the /api/settings routes.
// ============================================================

const { readData, writeData } = require('../utils/fileDb');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET SETTINGS: GET /api/settings
// Returns the current system settings object
// -------------------------------------------------------
function getSettings(req, res) {
    // Note: settings.json stores an object ({}), not an array ([])
    // readData normally returns an array, so we handle both cases
    const settings = readData('settings.json');

    // If readData returned an empty array (meaning the file is new/missing),
    // send back an empty object instead
    if (Array.isArray(settings)) {
        return res.json({});
    }

    // Otherwise send the settings object as-is
    res.json(settings);
}

// -------------------------------------------------------
// UPDATE SETTINGS: PUT /api/settings
// Overwrites the entire settings file with new values
// -------------------------------------------------------
function updateSettings(req, res) {
    // Step 1: Get the new settings from the request body
    const newSettings = req.body;

    // Step 2: Write the new settings to settings.json
    // (This completely replaces the old settings)
    const saved = writeData('settings.json', newSettings);

    if (!saved) {
        return res.status(500).json({ error: 'Failed to save settings. Please try again.' });
    }

    // Step 3: Log this action
    logAction(req.user.name, req.user.role, 'Updated', 'Settings',
        'Updated system settings', req.ip);

    // Step 4: Return the new settings to confirm the save
    res.json(newSettings);
}

module.exports = { getSettings, updateSettings };
