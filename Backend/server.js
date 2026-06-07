// ============================================================
// server.js - The Main Entry Point for the CareTrack Backend
// ============================================================
// This file starts the Express web server.
// It sets up all the middleware and connects all the API routes.
//
// HOW TO START THE SERVER:
//   Run: node server.js  (or npm start)
//   Then open: http://localhost:3000
// ============================================================

// Step 1: Import the required packages
const express = require('express'); // Express is the web framework we use to build the server
const path = require('path');       // path helps us build correct folder paths on any OS

// Step 2: Create the Express application
const app = express();
const cors = require('cors'); // CORS allows our frontend (running on a different port) to talk to our backend
app.use(cors()); // Enable CORS for all routes (you can configure this more tightly in production)
app.use(express.json());
// Step 3: Set the port number
// process.env.PORT allows hosting services (like Heroku) to set the port automatically
// If not set, we default to port 3000
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE SETUP
// Middleware are functions that run on every request before
// it reaches the route handler. Think of them as security
// guards that check and prepare the request first.
// ============================================================

// Allow the server to understand JSON data sent in request bodies
// (e.g. when a form submits { "username": "admin", "password": "123" })
app.use(express.json());

// Allow the server to understand form-encoded data (HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve all the frontend files (HTML, CSS, JS, images) as static files
// When someone visits http://localhost:3000, they get the Frontend folder contents
app.use(express.static(path.join(__dirname, '../Frontend')));

// ============================================================
// DEFAULT ROUTE
// When someone visits the root URL (/), send the main page
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// ============================================================
// API ROUTES
// Each route file handles a specific part of the application.
// We import each route file and tell Express which URL prefix
// it should handle.
// ============================================================

// Import all the route files
const authRoutes = require('./routes/authRoutes');         // Handles /api/auth/*
const doctorRoutes = require('./routes/doctorRoutes');     // Handles /api/doctors/*
const patientRoutes = require('./routes/patientRoutes');   // Handles /api/patients/*
const diagnosisRoutes = require('./routes/diagnosisRoutes'); // Handles /api/diagnoses/*
const scheduleRoutes = require('./routes/scheduleRoutes'); // Handles /api/schedules/*
const reportRoutes = require('./routes/reportRoutes');     // Handles /api/reports/*
const userRoutes = require('./routes/userRoutes');         // Handles /api/users/*
const settingsRoutes = require('./routes/settingsRoutes'); // Handles /api/settings/*
const auditRoutes = require('./routes/auditRoutes');       // Handles /api/audit-logs/*
const diagnosisCategoryRoutes = require('./routes/diagnosisCategoryRoutes'); // Handles /api/diagnosis-categories/*

// Connect each route file to its URL prefix
// Example: a GET request to /api/patients will be handled by patientRoutes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/diagnoses', diagnosisRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/diagnosis-categories', diagnosisCategoryRoutes);

// ============================================================
// 404 HANDLER
// If no route matched the request URL, send a 404 Not Found
// ============================================================
app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ============================================================
// START THE SERVER
// app.listen() starts the server on the given port and prints
// a message so you know it's running successfully.
// ============================================================
app.listen(PORT, () => {
    console.log('========================================');
    console.log(`  CareTrack MRMS Server is running!`);
    console.log(`  Open: http://localhost:${PORT}`);
    console.log('========================================');
});
