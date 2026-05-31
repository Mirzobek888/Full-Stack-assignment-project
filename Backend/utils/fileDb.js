// ============================================================
// fileDb.js - Our Simple "Database" using JSON files
// ============================================================
// Instead of a real database, we store all data in JSON files
// inside the /data folder. Each function below reads or writes
// one of those files.
// ============================================================

const fs = require('fs');   // fs = File System module (built into Node.js)
const path = require('path'); // path helps us build correct folder paths

// This is the folder where all our .json data files live
const dataDir = path.join(__dirname, '../data');

// If the /data folder doesn't exist yet, create it automatically
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// -------------------------------------------------------
// HELPER: Build the full file path for a given file name
// Example: 'patients' → 'C:/...Backend/data/patients.json'
// -------------------------------------------------------
function getFilePath(fileName) {
    // Add .json extension if the caller forgot to include it
    if (!fileName.endsWith('.json')) {
        fileName += '.json';
    }
    return path.join(dataDir, fileName);
}

// -------------------------------------------------------
// READ: Load all records from a JSON file
// Returns an array of records, or [] if the file is empty
// -------------------------------------------------------
function readData(fileName) {
    const filePath = getFilePath(fileName);

    try {
        // If the file doesn't exist yet, return an empty array
        if (!fs.existsSync(filePath)) {
            return [];
        }

        // Read the file content as text, then convert JSON text to a JS array
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);

    } catch (error) {
        // If something goes wrong (e.g. broken JSON), log it and return []
        console.error(`Error reading ${fileName}:`, error.message);
        return [];
    }
}

// -------------------------------------------------------
// WRITE: Save an array of records to a JSON file
// Returns true if successful, false if something failed
// -------------------------------------------------------
function writeData(fileName, data) {
    const filePath = getFilePath(fileName);

    try {
        // Convert the JS array to formatted JSON text, then save it
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;

    } catch (error) {
        console.error(`Error writing to ${fileName}:`, error.message);
        return false;
    }
}

// -------------------------------------------------------
// FIND ONE: Search for a single record by its ID
// Returns the record object, or null if not found
// -------------------------------------------------------
function findById(fileName, id) {
    const allRecords = readData(fileName);
    // .find() loops through the array and returns the first match
    const found = allRecords.find(record => record.id === id);
    return found || null;
}

// -------------------------------------------------------
// CREATE: Add a new record to a JSON file
// Returns the new record if saved, or null if it failed
// -------------------------------------------------------
function createRecord(fileName, newRecord) {
    const allRecords = readData(fileName);

    // Add the new record to the end of the list
    allRecords.push(newRecord);

    // Save the updated list back to the file
    const saved = writeData(fileName, allRecords);
    return saved ? newRecord : null;
}

// -------------------------------------------------------
// UPDATE: Change an existing record by its ID
// Merges the new fields into the old record
// Returns the updated record, or null if not found
// -------------------------------------------------------
function updateRecord(fileName, id, updatedFields) {
    const allRecords = readData(fileName);

    // Find the position (index) of the record in the array
    const index = allRecords.findIndex(record => record.id === id);

    if (index === -1) {
        // Record with that ID doesn't exist
        return null;
    }

    // Merge old fields + new fields, but always keep the original ID
    allRecords[index] = { ...allRecords[index], ...updatedFields, id: id };

    // Save the updated list
    const saved = writeData(fileName, allRecords);
    return saved ? allRecords[index] : null;
}

// -------------------------------------------------------
// DELETE: Remove a record by its ID from a JSON file
// Returns true if deleted, false if not found
// -------------------------------------------------------
function deleteRecord(fileName, id) {
    const allRecords = readData(fileName);

    // Keep all records EXCEPT the one with the matching ID
    const remaining = allRecords.filter(record => record.id !== id);

    // If the lengths are the same, the record wasn't found
    if (remaining.length === allRecords.length) {
        return false;
    }

    // Save the filtered list (without the deleted record)
    return writeData(fileName, remaining);
}

// Export all functions so other files can use them
module.exports = {
    readData,
    writeData,
    findById,
    createRecord,
    updateRecord,
    deleteRecord
};
