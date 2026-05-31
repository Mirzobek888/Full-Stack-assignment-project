// ============================================================
// idGenerator.js - Generates unique IDs for records
// ============================================================
// Every record (patient, doctor, etc.) needs a unique ID so
// we can find and update it later. This function creates one
// by combining a prefix (like "PAT"), the current time, and
// a random string.
//
// Example output: "PAT-MP8OU7TR-TU8R"
// ============================================================

function generateId(prefix = 'ID') {
    // Convert current timestamp (milliseconds) to a short base-36 string
    // base-36 uses numbers 0-9 and letters a-z, making shorter strings
    const timestampPart = Date.now().toString(36);

    // Generate 4 random characters to make the ID unique
    const randomPart = Math.random().toString(36).substring(2, 6);

    // Combine prefix + timestamp + random part, and make it uppercase
    return `${prefix}-${timestampPart}-${randomPart}`.toUpperCase();
}

// Export so other files can use generateId()
module.exports = { generateId };
