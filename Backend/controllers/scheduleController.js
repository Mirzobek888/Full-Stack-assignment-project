// ============================================================
// scheduleController.js - Handles Doctor Schedule CRUD
// ============================================================
// Schedules store which days and times each doctor is available.
// These functions run when hitting the /api/schedules routes.
// ============================================================

const { readData, findById, createRecord, updateRecord, deleteRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET ALL SCHEDULES: GET /api/schedules
// Returns all doctor schedules from schedules.json
// -------------------------------------------------------
function getSchedules(req, res) {
    const schedules = readData('schedules.json');
    res.json(schedules);
}

// -------------------------------------------------------
// CREATE SCHEDULE: POST /api/schedules
// Adds a new schedule entry for a doctor
// -------------------------------------------------------
function createSchedule(req, res) {
    // Build the new schedule object with a unique ID
    const newSchedule = {
        id: generateId('SCH'), // e.g. "SCH-MP8OU7TR-TU8R"
        ...req.body            // doctorId, day, startTime, endTime, etc.
    };

    const savedSchedule = createRecord('schedules.json', newSchedule);

    if (!savedSchedule) {
        return res.status(500).json({ error: 'Failed to save schedule. Please try again.' });
    }

    logAction(req.user.name, req.user.role, 'Created', 'Schedule',
        `Created schedule for doctor ${newSchedule.doctorId}`, req.ip);

    res.status(201).json(savedSchedule);
}

// -------------------------------------------------------
// UPDATE SCHEDULE: PUT /api/schedules/:id
// Updates an existing schedule entry
// -------------------------------------------------------
function updateSchedule(req, res) {
    const updatedSchedule = updateRecord('schedules.json', req.params.id, req.body);

    if (!updatedSchedule) {
        return res.status(404).json({ error: 'Schedule not found.' });
    }

    logAction(req.user.name, req.user.role, 'Updated', 'Schedule',
        `Updated schedule ${updatedSchedule.id}`, req.ip);

    res.json(updatedSchedule);
}

// -------------------------------------------------------
// DELETE SCHEDULE: DELETE /api/schedules/:id
// Removes a schedule entry permanently
// -------------------------------------------------------
function deleteSchedule(req, res) {
    // Check if the schedule exists before trying to delete it
    const schedule = findById('schedules.json', req.params.id);

    if (!schedule) {
        return res.status(404).json({ error: 'Schedule not found.' });
    }

    const wasDeleted = deleteRecord('schedules.json', req.params.id);

    if (!wasDeleted) {
        return res.status(500).json({ error: 'Failed to delete schedule. Please try again.' });
    }

    logAction(req.user.name, req.user.role, 'Deleted', 'Schedule',
        `Deleted schedule ${req.params.id}`, req.ip);

    res.json({ message: 'Schedule deleted successfully.' });
}

module.exports = { getSchedules, createSchedule, updateSchedule, deleteSchedule };
