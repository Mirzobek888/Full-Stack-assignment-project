// reportController.js - Handles Patient Report generation
// ==========================================
// Reports are summaries generated for a specific patient.
// These functions run when hitting the /api/reports routes.

const { readData, writeData } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');

// GET ALL REPORTS: GET /api/reports
// Returns all previously generated reports from reports.json
function getReports(req, res) {
    const reports = readData('reports.json');
    res.json(reports);
}

// GENERATE PATIENT REPORT: POST /api/reports/patient/:patientId
// Creates a new report record for a specific patient
function generatePatientReport(req, res) {
    const { patientId } = req.params;
    const { type, notes } = req.body;

    // Validate required fields
    if (!type) {
        return res.status(400).json({ error: 'Report type is required' });
    }

    // Validate report type enum
    const validTypes = ['Medical', 'Surgical', 'Lab', 'Diagnostic', 'Summary'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid report type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Check if patient exists
    const patients = readData('patients.json');
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
    }

    const reports = readData('reports.json');
    const newReport = {
        id: generateId('REP'),
        patientId,
        type,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id || 'system'
    };

    reports.push(newReport);
    writeData('reports.json', reports);

    // Audit log
    const auditLogger = require('../utils/auditLogger');
    auditLogger.logAction(
        req.user?.name || 'Unknown',
        req.user?.role || 'Unknown',
        'Created',
        'Report',
        `Report ${newReport.id} generated for patient ${patientId}`,
        req.ip
    );

    res.status(201).json(newReport);
}

// GET PATIENT REPORTS: GET /api/reports/patient/:patientId
// Returns all reports for a specific patient
function getPatientReports(req, res) {
    const { patientId } = req.params;
    const reports = readData('reports.json');
    const patientReports = reports.filter(r => r.patientId === patientId);
    res.json(patientReports);
}

// DELETE REPORT: DELETE /api/reports/:reportId
// Deletes a specific report
function deleteReport(req, res) {
    const { reportId } = req.params;
    const reports = readData('reports.json');
    const reportIndex = reports.findIndex(r => r.id === reportId);

    if (reportIndex === -1) {
        return res.status(404).json({ error: 'Report not found' });
    }

    const deletedReport = reports.splice(reportIndex, 1)[0];
    writeData('reports.json', reports);

    // Audit log
    const auditLogger = require('../utils/auditLogger');
    auditLogger.logAction(
        req.user?.name || 'Unknown',
        req.user?.role || 'Unknown',
        'Deleted',
        'Report',
        `Report ${reportId} deleted`,
        req.ip
    );

    res.json({ message: 'Report deleted successfully' });
}

module.exports = {
    getReports,
    generatePatientReport,
    getPatientReports,
    deleteReport
};
