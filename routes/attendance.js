// ============================================================
// routes/attendance.js — Attendance get/mark endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// GET /api/attendance/:studentId/:semester — Get attendance records
router.get('/:studentId/:semester', async (req, res) => {
    try {
        const { studentId, semester } = req.params;
        const semKey = semester.startsWith('Semester') ? semester : `Semester ${semester}`;

        const records = await Attendance.find({ studentId, semester: semKey });

        // Transform to match frontend expected format: { subjectName: { code, attended, total, attendedDates, missedDates } }
        const result = {};
        records.forEach(r => {
            result[r.subject] = {
                code: r.code,
                attended: r.attendedDates.length,
                total: r.attendedDates.length + r.missedDates.length,
                attendedDates: r.attendedDates,
                missedDates: r.missedDates
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/attendance/mark — Mark attendance (present/absent)
router.put('/mark', async (req, res) => {
    try {
        const { studentId, semester, subject, date, present } = req.body;

        const record = await Attendance.findOne({ studentId, semester, subject });
        if (!record) return res.status(404).json({ error: 'Attendance record not found' });

        if (present) {
            if (!record.attendedDates.includes(date)) record.attendedDates.push(date);
            record.missedDates = record.missedDates.filter(d => d !== date);
        } else {
            if (!record.missedDates.includes(date)) record.missedDates.push(date);
            record.attendedDates = record.attendedDates.filter(d => d !== date);
        }

        await record.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
