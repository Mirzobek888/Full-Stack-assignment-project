// ============================================================
// doctorController.js - Handles all Doctor CRUD operations
// ============================================================
// These functions run when someone hits the /api/doctors routes.
// ============================================================

const { readData, findById, createRecord, updateRecord, deleteRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET ALL DOCTORS: GET /api/doctors
// Returns the full list of doctors from doctors.json
// -------------------------------------------------------
function getDoctors(req, res) {
    const doctors = readData('doctors.json');
    res.json(doctors);
}

// -------------------------------------------------------
// GET ONE DOCTOR: GET /api/doctors/:id
// Returns a single doctor by their ID
// -------------------------------------------------------
function getDoctorById(req, res) {
    const doctor = findById('doctors.json', req.params.id);

    if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }

    res.json(doctor);
}

// -------------------------------------------------------
// CREATE DOCTOR: POST /api/doctors
// Adds a new doctor record
// -------------------------------------------------------
function createDoctor(req, res) {
    // Step 1: Build the new doctor object with a unique ID
    const newDoctor = {
        id: generateId('DOC'),  // e.g. "DOC-MP8OU7TR-TU8R"
        ...req.body             // Spread all fields from the form
    };

    // Step 2: Save to the JSON file
    const savedDoctor = createRecord('doctors.json', newDoctor);

    if (!savedDoctor) {
        return res.status(500).json({ error: 'Failed to save doctor. Please try again.' });
    }

    // Step 3: Log this action
    logAction(req.user.name, req.user.role, 'Created', 'Doctor',
        `Created doctor ${newDoctor.fullName}`, req.ip);

    // Step 4: Send back the new doctor with 201 Created
    res.status(201).json(savedDoctor);
}

// -------------------------------------------------------
// UPDATE DOCTOR: PUT /api/doctors/:id
// Updates an existing doctor's data
// -------------------------------------------------------
function updateDoctor(req, res) {
    const updatedDoctor = updateRecord('doctors.json', req.params.id, req.body);

    if (!updatedDoctor) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }

    logAction(req.user.name, req.user.role, 'Updated', 'Doctor',
        `Updated doctor ${updatedDoctor.fullName}`, req.ip);

    res.json(updatedDoctor);
}

// -------------------------------------------------------
// DELETE DOCTOR: DELETE /api/doctors/:id
// Removes a doctor record permanently
// -------------------------------------------------------
function deleteDoctor(req, res) {
    // Find the doctor first so we can use their name in the log
    const doctor = findById('doctors.json', req.params.id);

    if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found.' });
    }

    const wasDeleted = deleteRecord('doctors.json', req.params.id);

    if (!wasDeleted) {
        return res.status(500).json({ error: 'Failed to delete doctor. Please try again.' });
    }

    logAction(req.user.name, req.user.role, 'Deleted', 'Doctor',
        `Deleted doctor ${doctor.fullName}`, req.ip);

    res.json({ message: 'Doctor deleted successfully.' });
}

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
