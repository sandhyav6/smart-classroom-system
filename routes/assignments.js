// ============================================================
// routes/assignments.js — Assignment CRUD endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// GET /api/assignments — List all (with optional course filter)
router.get('/', async (req, res) => {
    try {
        const { course, q } = req.query;
        let filter = {};

        if (course && course !== 'All') {
            filter.course = course;
        }
        if (q) {
            const regex = new RegExp(q, 'i');
            filter.$or = [
                { title: regex },
                { course: regex },
                { courseCode: regex }
            ];
        }

        const assignments = await Assignment.find(filter).sort({ dueDate: -1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/assignments/:id — Get single assignment
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findOne({ assignmentId: parseInt(req.params.id) });
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/assignments — Create new assignment
router.post('/', async (req, res) => {
    try {
        // Auto-increment assignmentId
        const last = await Assignment.findOne().sort({ assignmentId: -1 });
        const newId = last ? last.assignmentId + 1 : 1;

        const assignment = new Assignment({
            ...req.body,
            assignmentId: newId
        });
        await assignment.save();
        res.status(201).json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/assignments/:id — Update assignment
router.put('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndUpdate(
            { assignmentId: parseInt(req.params.id) },
            { $set: req.body },
            { new: true }
        );
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.json({ success: true, assignment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/assignments/:id — Delete assignment
router.delete('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({ assignmentId: parseInt(req.params.id) });
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
