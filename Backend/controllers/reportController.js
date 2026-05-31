// ============================================================
// reportController.js - Handles Patient Report generation
// ============================================================
// Reports are summaries generated for a specific patient.
// These functions run when hitting the /api/reports routes.
// ============================================================

const { readData, createRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET ALL REPORTS: GET /api/reports
// Returns all previously generated reports from reports.json
// -------------------------------------------------------
function getReports(req, res) {
    const reports = readData('reports.json');
    res.json(reports);
}

// -------------------------------------------------------
// GENERATE PATIENT REPORT: POST /api/reports/patient/:patientId
// Creates a new report record for a specific patient
// -------------------------------------------------------
function generatePatientReport(req, res) {
    // Step 1: Get the patient ID from the URL (e.g. /api/reports/patient/PAT-001)
    const { patientId } = req.params;

    // Step 2: Look up the patient in patients.json to get their name
    const patients = readData('patients.json');
    const patient = patients.find(p => p.id === patientId);

    // Step 3: If patient doesn't exist, return an error
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found. Cannot generate report.' });
    }

    // Step 4: Build the new report record
    const newReport = {
        id: generateId('REP'),                             // Unique ID like "REP-MP8OU7TR-TU8R"
        name: `Diagnosis Report - ${patient.firstName} ${patient.lastName}`,
        patientId: patientId,                              // Which patient this report is for
        department: patient.department,                    // Their department
        createdBy: req.user.name,                          // Who generated it
        date: new Date().toISOString().split('T')[0],      // Today's date
        status: 'Generated'
    };

    // Step 5: Save the new report to reports.json
    const savedReport = createRecord('reports.json', newReport);

    if (!savedReport) {
        return res.status(500).json({ error: 'Failed to generate report. Please try again.' });
    }

    // Step 6: Log this action in the audit trail
    logAction(req.user.name, req.user.role, 'Generated', 'Report',
        `Generated report for patient ${patientId}`, req.ip);

    // Step 7: Return the new report with 201 Created
    res.status(201).json(savedReport);
}

module.exports = { getReports, generatePatientReport };
