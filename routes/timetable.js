// ============================================================
// routes/timetable.js — Timetable endpoints
// Provides student and faculty timetable data from MongoDB
// ============================================================

const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');

// GET /api/timetable/:semester?section=A — Get timetable for semester + section
router.get('/:semester', async (req, res) => {
    try {
        const { semester } = req.params;
        const { section } = req.query;
        
        let semKey = semester;
        if (!semKey.startsWith('Semester')) {
            semKey = `Semester ${semester}`;
        }

        if (section) {
            const timetable = await Timetable.findOne({ semester: semKey, section });
            if (!timetable) {
                return res.status(404).json({ error: 'Timetable not found for this semester and section' });
            }
            res.json(timetable);
        } else {
            const timetables = await Timetable.find({ semester: semKey });
            res.json(timetables);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/faculty-timetable?facultyId=10001 — Get faculty's assigned classes
router.get('/faculty/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        
        const faculty = await Faculty.findOne({ id: facultyId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Get all timetables and extract classes where this faculty teaches
        const allTimetables = await Timetable.find();
        const classes = [];

        for (const tt of allTimetables) {
            for (const [timeSlot, daySchedule] of Object.entries(tt.schedule)) {
                for (const [day, classInfo] of Object.entries(daySchedule)) {
                    if (classInfo && classInfo.facultyId === facultyId) {
                        classes.push({
                            semester: tt.semester,
                            section: tt.section,
                            time: timeSlot,
                            day,
                            ...classInfo
                        });
                    }
                }
            }
        }

        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get faculty timetable as a nested schedule (for display)
router.get('/', async (req, res) => {
    try {
        const { facultyId } = req.query;
        
        if (!facultyId) {
            return res.status(400).json({ error: 'facultyId query param required' });
        }

        const faculty = await Faculty.findOne({ id: facultyId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found' });
        }

        // Get all timetables and extract classes where this faculty teaches
        const allTimetables = await Timetable.find();
        const schedule = {};

        for (const tt of allTimetables) {
            const key = `${tt.semester}|${tt.section}`;
            schedule[key] = tt.schedule;
        }

        res.json({ facultyId, schedule });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
