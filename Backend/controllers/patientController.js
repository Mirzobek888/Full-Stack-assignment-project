// ============================================================
// patientController.js - Handles all Patient CRUD operations
// ============================================================
// CRUD = Create, Read, Update, Delete
// These functions run when someone hits the /api/patients routes.
// ============================================================

const { readData, findById, createRecord, updateRecord, deleteRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET ALL PATIENTS: GET /api/patients
// Returns the full list of patients from patients.json
// -------------------------------------------------------
function getPatients(req, res) {
    // Read all patient records from the JSON file
    const patients = readData('patients.json');

    // Send them as a JSON response
    res.json(patients);
}

// -------------------------------------------------------
// GET ONE PATIENT: GET /api/patients/:id
// Returns a single patient by their ID
// -------------------------------------------------------
function getPatientById(req, res) {
    // req.params.id is the ID from the URL, e.g. /api/patients/PAT-001
    const patient = findById('patients.json', req.params.id);

    // If no patient found with that ID, return 404 Not Found
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    res.json(patient);
}

// -------------------------------------------------------
// CREATE PATIENT: POST /api/patients
// Creates a new patient record from the request body
// -------------------------------------------------------
function createPatient(req, res) {
    // Step 1: Get the patient data from the request body (sent by the form)
    const patientData = req.body;

    // Step 2: Build the new patient object
    const newPatient = {
        id: generateId('PAT'),                           // Generate a unique ID like "PAT-MP8OU7TR-TU8R"
        ...patientData,                                  // Spread all fields sent from the form
        createdAt: new Date().toISOString().split('T')[0] // Today's date, e.g. "2026-05-18"
    };

    // Step 3: Save the new patient to the JSON file
    const savedPatient = createRecord('patients.json', newPatient);

    // Step 4: If saving failed, return a 500 error
    if (!savedPatient) {
        return res.status(500).json({ error: 'Failed to save patient. Please try again.' });
    }

    // Step 5: Log this action in the audit trail
    logAction(req.user.name, req.user.role, 'Created', 'Patient',
        `Registered patient ${newPatient.firstName} ${newPatient.lastName}`, req.ip);

    // Step 6: Return the newly created patient with a 201 Created status
    res.status(201).json(savedPatient);
}

// -------------------------------------------------------
// UPDATE PATIENT: PUT /api/patients/:id
// Updates an existing patient's data
// -------------------------------------------------------
function updatePatient(req, res) {
    // Step 1: Try to update the patient with the given ID
    const updatedPatient = updateRecord('patients.json', req.params.id, req.body);

    // Step 2: If no patient was found with that ID, return 404
    if (!updatedPatient) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    // Step 3: Log this update action
    logAction(req.user.name, req.user.role, 'Updated', 'Patient',
        `Updated patient ${updatedPatient.firstName} ${updatedPatient.lastName}`, req.ip);

    // Step 4: Return the updated patient data
    res.json(updatedPatient);
}

// -------------------------------------------------------
// DELETE PATIENT: DELETE /api/patients/:id
// Removes a patient record permanently
// -------------------------------------------------------
function deletePatient(req, res) {
    // Step 1: Find the patient first (so we can use their name in the log)
    const patient = findById('patients.json', req.params.id);

    if (!patient) {
        return res.status(404).json({ error: 'Patient not found.' });
    }

    // Step 2: Delete the patient from the JSON file
    const wasDeleted = deleteRecord('patients.json', req.params.id);

    if (!wasDeleted) {
        return res.status(500).json({ error: 'Failed to delete patient. Please try again.' });
    }

    // Step 3: Log the deletion
    logAction(req.user.name, req.user.role, 'Deleted', 'Patient',
        `Deleted patient ${patient.firstName} ${patient.lastName}`, req.ip);

    res.json({ message: 'Patient deleted successfully.' });
}

// Export all functions for use in the route file
module.exports = { getPatients, getPatientById, createPatient, updatePatient, deletePatient };
