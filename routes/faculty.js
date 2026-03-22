// ============================================================
// routes/faculty.js — Faculty read/search endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// GET /api/faculty — List all (with optional search)
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let faculty;
        if (q) {
            const regex = new RegExp(q, 'i');
            faculty = await Faculty.find({
                $or: [
                    { name: regex },
                    { id: regex },
                    { subjects: regex }
                ]
            }).select('-password');
        } else {
            faculty = await Faculty.find().select('-password');
        }
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/faculty/:id — Get single faculty by employee ID
router.get('/:id', async (req, res) => {
    try {
        const faculty = await Faculty.findOne({ id: req.params.id }).select('-password');
        if (!faculty) return res.status(404).json({ error: 'Faculty not found' });
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
