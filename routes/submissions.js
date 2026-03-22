// ============================================================
// routes/submissions.js — Assignment submission endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');

// GET /api/submissions/:studentId/:assignmentId — Get submission
router.get('/:studentId/:assignmentId', async (req, res) => {
    try {
        const submission = await Submission.findOne({
            studentId: req.params.studentId,
            assignmentId: parseInt(req.params.assignmentId)
        });
        res.json(submission || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/submissions — Submit assignment
router.post('/', async (req, res) => {
    try {
        const { studentId, assignmentId, file } = req.body;

        const submission = await Submission.findOneAndUpdate(
            { studentId, assignmentId },
            {
                studentId,
                assignmentId,
                file,
                date: new Date().toISOString().split('T')[0],
                status: 'submitted'
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, submission });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
