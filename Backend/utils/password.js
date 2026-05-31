// ============================================================
// password.js - Salted password hashing (Node built-in crypto)
// ============================================================
// Passwords must never be stored as plain text. We use scrypt,
// a slow, memory-hard hashing algorithm, with a unique random
// salt per user. Stored format: "scrypt$<salt>$<hash>".
// ============================================================

const crypto = require('node:crypto');

// Hash a plain-text password into a salted scrypt string
function hashPassword(plain) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
    return `scrypt$${salt}$${hash}`;
}

// Verify a plain-text password against a stored "scrypt$salt$hash" value
function verifyPassword(plain, stored) {
    if (typeof stored !== 'string' || !stored.startsWith('scrypt$')) return false;
    const [, salt, hash] = stored.split('$');
    const test = crypto.scryptSync(plain, salt, 64).toString('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(test, 'hex');
    // timingSafeEqual prevents timing attacks; lengths must match first
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { hashPassword, verifyPassword };
