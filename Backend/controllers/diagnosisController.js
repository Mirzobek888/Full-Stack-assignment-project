// ============================================================
// diagnosisController.js - Handles all Diagnosis CRUD operations
// ============================================================
// These functions run when someone hits the /api/diagnoses routes.
// A diagnosis links a patient to a disease/condition with details
// like ICD code, severity, and treating doctor.
// ============================================================

const { readData, findById, createRecord, updateRecord, deleteRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET ALL DIAGNOSES: GET /api/diagnoses
// Returns the full list of diagnoses from diagnoses.json
// -------------------------------------------------------
function getDiagnoses(req, res) {
    const diagnoses = readData('diagnoses.json');
    res.json(diagnoses);
}

// -------------------------------------------------------
// GET ONE DIAGNOSIS: GET /api/diagnoses/:id
// Returns a single diagnosis by its ID
// -------------------------------------------------------
function getDiagnosisById(req, res) {
    const diagnosis = findById('diagnoses.json', req.params.id);

    if (!diagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found.' });
    }

    res.json(diagnosis);
}

// -------------------------------------------------------
// CREATE DIAGNOSIS: POST /api/diagnoses
// Adds a new diagnosis record for a patient
// -------------------------------------------------------
function createDiagnosis(req, res) {
    // Step 1: Build the new diagnosis object
    const newDiagnosis = {
        id: generateId('DIA'),                            // Unique ID like "DIA-MP8OU7TR-TU8R"
        ...req.body,                                      // All fields from the form
        createdBy: req.user.name,                         // Who created this diagnosis
        lastUpdated: new Date().toISOString().split('T')[0] // Today's date
    };

    // Step 2: Save to diagnoses.json
    const savedDiagnosis = createRecord('diagnoses.json', newDiagnosis);

    if (!savedDiagnosis) {
        return res.status(500).json({ error: 'Failed to save diagnosis. Please try again.' });
    }

    // Step 3: Log the action
    logAction(req.user.name, req.user.role, 'Created', 'Diagnosis',
        `Added diagnosis ${newDiagnosis.icdCode} for patient ${newDiagnosis.patientId}`, req.ip);

    // Step 4: Return the new diagnosis with 201 Created
    res.status(201).json(savedDiagnosis);
}

// -------------------------------------------------------
// UPDATE DIAGNOSIS: PUT /api/diagnoses/:id
// Updates an existing diagnosis record
// -------------------------------------------------------
function updateDiagnosis(req, res) {
    // Always update the lastUpdated date when editing
    const updatedFields = {
        ...req.body,
        lastUpdated: new Date().toISOString().split('T')[0]
    };

    const updatedDiagnosis = updateRecord('diagnoses.json', req.params.id, updatedFields);

    if (!updatedDiagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found.' });
    }

    logAction(req.user.name, req.user.role, 'Updated', 'Diagnosis',
        `Updated diagnosis ${updatedDiagnosis.icdCode} for patient ${updatedDiagnosis.patientId}`, req.ip);

    res.json(updatedDiagnosis);
}

// -------------------------------------------------------
// DELETE DIAGNOSIS: DELETE /api/diagnoses/:id
// Removes a diagnosis record permanently
// -------------------------------------------------------
function deleteDiagnosis(req, res) {
    // Find it first so we have the ICD code for the log
    const diagnosis = findById('diagnoses.json', req.params.id);

    if (!diagnosis) {
        return res.status(404).json({ error: 'Diagnosis not found.' });
    }

    const wasDeleted = deleteRecord('diagnoses.json', req.params.id);

    if (!wasDeleted) {
        return res.status(500).json({ error: 'Failed to delete diagnosis. Please try again.' });
    }

    logAction(req.user.name, req.user.role, 'Deleted', 'Diagnosis',
        `Deleted diagnosis ${diagnosis.icdCode}`, req.ip);

    res.json({ message: 'Diagnosis deleted successfully.' });
}

module.exports = { getDiagnoses, getDiagnosisById, createDiagnosis, updateDiagnosis, deleteDiagnosis };
