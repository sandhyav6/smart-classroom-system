// ============================================================
// routes/marks.js — Marks get/update endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const Marks = require('../models/Marks');

// GET /api/marks/:studentId/:semester — Get marks for student + semester
router.get('/:studentId/:semester', async (req, res) => {
    try {
        const { studentId, semester } = req.params;
        const semKey = semester.startsWith('Semester') ? semester : `Semester ${semester}`;

        const marks = await Marks.find({ studentId, semester: semKey });
        res.json(marks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/marks/:studentId/:semester/:subjectCode — Update marks for one subject
router.put('/:studentId/:semester/:subjectCode', async (req, res) => {
    try {
        const { studentId, semester, subjectCode } = req.params;
        const { field, value } = req.body;
        const semKey = semester.startsWith('Semester') ? semester : `Semester ${semester}`;

        const mark = await Marks.findOne({ studentId, semester: semKey, code: subjectCode });
        if (!mark) return res.status(404).json({ error: 'Marks record not found' });

        mark[field] = value;

        // Recalculate totals if assessment field was changed
        if (['da1', 'da2', 'da3', 'cat1', 'cat2', 'fat'].includes(field)) {
            mark.internal = (mark.da1 || 0) + (mark.da2 || 0) + (mark.da3 || 0);
            let total = Math.floor(((mark.internal + (mark.cat1 || 0) + (mark.cat2 || 0) + (mark.fat || 0)) / 230) * 100);
            if (total > 100) total = 100;
            mark.total = total;
            mark.grade = calcGrade(total);
            mark.remarks = mark.grade === 'F' ? 'Re-appear' : 'Good';
        }

        await mark.save();
        res.json({ success: true, marks: mark });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function calcGrade(score) {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 69) return 'B';
    if (score >= 64) return 'C';
    if (score >= 59) return 'D';
    if (score >= 50) return 'E';
    return 'F';
}

module.exports = router;
