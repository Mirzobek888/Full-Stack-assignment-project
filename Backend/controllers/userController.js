// ============================================================
// userController.js - Handles all System User CRUD operations
// ============================================================
// System users are staff accounts (admin, clinician, receptionist).
// These functions are only accessible to administrators.
//
// IMPORTANT: We never send passwords back to the browser.
// We always strip the password field before sending user data.
// ============================================================

const { readData, findById, createRecord, updateRecord, deleteRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// -------------------------------------------------------
// GET ALL USERS: GET /api/users
// Returns all staff accounts, but WITHOUT their passwords
// -------------------------------------------------------
function getUsers(req, res) {
    const users = readData('users.json');

    // Remove the password field from each user before sending
    // We use destructuring: { password, ...rest } — password goes away, rest is kept
    const safeUsers = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

    res.json(safeUsers);
}

// -------------------------------------------------------
// CREATE USER: POST /api/users
// Creates a new staff account
// -------------------------------------------------------
function createUser(req, res) {
    // Step 1: Build the new user object
    const newUser = {
        id: generateId('USR'), // e.g. "USR-MP8OU7TR-TU8R"
        ...req.body            // name, username, password, role, department, status
    };

    // Step 2: Check if the username is already taken
    const existingUsers = readData('users.json');
    const usernameAlreadyExists = existingUsers.find(u => u.username === newUser.username);

    if (usernameAlreadyExists) {
        return res.status(400).json({ error: `Username "${newUser.username}" is already taken. Please choose another.` });
    }

    // Step 3: Save the new user to users.json
    const savedUser = createRecord('users.json', newUser);

    if (!savedUser) {
        return res.status(500).json({ error: 'Failed to create user. Please try again.' });
    }

    // Step 4: Log this action
    logAction(req.user.name, req.user.role, 'Created', 'User',
        `Created user ${newUser.username}`, req.ip);

    // Step 5: Return the new user WITHOUT the password
    const { password, ...safeUser } = savedUser;
    res.status(201).json(safeUser);

}

// -------------------------------------------------------
// UPDATE USER: PUT /api/users/:id
// Updates a staff account's details
// If no new password is provided, the old one is kept
// -------------------------------------------------------
function updateUser(req, res) {
    // Step 1: Find the existing user to get their current password
    const existingUser = findById('users.json', req.params.id);

    if (!existingUser) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Step 2: Prepare the updated data
    const updatedData = { ...req.body };

    // Step 3: If no new password was provided, keep the existing one
    // This prevents accidentally clearing someone's password
    if (!updatedData.password) {
        updatedData.password = existingUser.password;
    }

    // Step 4: Save the updated user
    const updatedUser = updateRecord('users.json', req.params.id, updatedData);

    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Step 5: Log this action
    logAction(req.user.name, req.user.role, 'Updated', 'User',
        `Updated user ${updatedUser.username}`, req.ip);

    // Step 6: Return the updated user WITHOUT the password
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);

}

// -------------------------------------------------------
// DELETE USER: DELETE /api/users/:id
// Removes a staff account
// Note: You cannot delete your own account
// -------------------------------------------------------
function deleteUser(req, res) {
    // Step 1: Find the user to delete
    const userToDelete = findById('users.json', req.params.id);

    if (!userToDelete) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Step 2: Prevent an admin from deleting their own account
    if (req.user.id === req.params.id) {
        return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    // Step 3: Delete the user
    const wasDeleted = deleteRecord('users.json', req.params.id);

    if (!wasDeleted) {
        return res.status(500).json({ error: 'Failed to delete user. Please try again.' });
    }

    // Step 4: Log this action
    logAction(req.user.name, req.user.role, 'Deleted', 'User',
        `Deleted user ${userToDelete.username}`, req.ip);

    res.json({ message: 'User deleted successfully.' });

}

module.exports = { getUsers, createUser, updateUser, deleteUser };
