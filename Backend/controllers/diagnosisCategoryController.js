const { readData, createRecord } = require('../utils/fileDb');
const { generateId } = require('../utils/idGenerator');
const { logAction } = require('../utils/auditLogger');

// GET categories
function getCategories(req, res) {
    const cats = readData('diagnosisCategories.json');
    res.json(cats);
}

// CREATE category
function createCategory(req, res) {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    const existing = readData('diagnosisCategories.json').find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return res.status(200).json(existing);

    const newCat = { id: generateId('CAT'), name: name.trim() };
    const saved = createRecord('diagnosisCategories.json', newCat);
    if (!saved) return res.status(500).json({ error: 'Failed to save category.' });

    logAction(req.user ? req.user.name : 'System', req.user ? req.user.role : 'system', 'Created', 'DiagnosisCategory', `Created category ${newCat.name}`, req.ip);

    res.status(201).json(newCat);
}

module.exports = { getCategories, createCategory };
