// ============================================================
// routes/misc.js — Timetable, reminders, chat
// (Materials moved to routes/materials.js)
// ============================================================
const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const Reminder = require('../models/Reminder');

// ============================================================
// TIMETABLE — Static data
// ============================================================
const TIMETABLE = {
    'Semester 1': {
        schedule: {
            '09:00 - 09:50': { Mon: { code: 'CSE101', name: 'Programming in C', location: 'AB1-201' }, Tue: null, Wed: { code: 'CSE101', name: 'Programming in C', location: 'AB1-201' }, Thu: null, Fri: { code: 'CSE101', name: 'Programming in C', location: 'AB1-201' } },
            '10:00 - 10:50': { Mon: { code: 'MAT101', name: 'Calculus', location: 'AB2-105' }, Tue: { code: 'MAT101', name: 'Calculus', location: 'AB2-105' }, Wed: null, Thu: { code: 'MAT101', name: 'Calculus', location: 'AB2-105' }, Fri: null },
            '11:00 - 11:50': { Mon: { code: 'PHY101', name: 'Physics', location: 'TB-304' }, Tue: null, Wed: { code: 'PHY101', name: 'Physics', location: 'TB-304' }, Thu: { code: 'PHY101', name: 'Physics', location: 'TB-304' }, Fri: null },
            '13:00 - 13:50': { Mon: null, Tue: { code: 'CSE101L', name: 'C Lab', location: 'Lab-105' }, Wed: null, Thu: { code: 'PHY101L', name: 'Physics Lab', location: 'Lab-201' }, Fri: null },
            '14:00 - 14:50': { Mon: { code: 'ENG101', name: 'English', location: 'MB-102' }, Tue: null, Wed: { code: 'ENG101', name: 'English', location: 'MB-102' }, Thu: null, Fri: { code: 'ENG101', name: 'English', location: 'MB-102' } },
            '15:00 - 15:50': { Mon: null, Tue: { code: 'CSE101L', name: 'C Lab', location: 'Lab-105' }, Wed: null, Thu: { code: 'PHY101L', name: 'Physics Lab', location: 'Lab-201' }, Fri: null }
        }
    },
    'Semester 2': {
        schedule: {
            '09:00 - 09:50': { Mon: { code: 'CSE201', name: 'Data Structures', location: 'AB1-301' }, Tue: null, Wed: { code: 'CSE201', name: 'Data Structures', location: 'AB1-301' }, Thu: null, Fri: { code: 'CSE201', name: 'Data Structures', location: 'AB1-301' } },
            '10:00 - 10:50': { Mon: { code: 'MAT201', name: 'Linear Algebra', location: 'AB2-201' }, Tue: { code: 'MAT201', name: 'Linear Algebra', location: 'AB2-201' }, Wed: null, Thu: { code: 'MAT201', name: 'Linear Algebra', location: 'AB2-201' }, Fri: null },
            '11:00 - 11:50': { Mon: null, Tue: { code: 'CSE202', name: 'Digital Logic', location: 'TB-404' }, Wed: { code: 'CSE202', name: 'Digital Logic', location: 'TB-404' }, Thu: null, Fri: { code: 'CSE202', name: 'Digital Logic', location: 'TB-404' } },
            '14:00 - 14:50': { Mon: { code: 'HUM201', name: 'Ethics', location: 'MB-202' }, Tue: null, Wed: null, Thu: { code: 'HUM201', name: 'Ethics', location: 'MB-202' }, Fri: null }
        }
    }
};

const FACULTY_TIMETABLE = [
    { time: '09:00 - 09:50', subject: 'Data Structures', section: 'CSE-2A', room: 'AB1-201' },
    { time: '11:00 - 11:50', subject: 'Algorithms', section: 'CSE-2B', room: 'AB1-205' },
    { time: '14:00 - 14:50', subject: 'Database Systems', section: 'CSE-3A', room: 'TB-304' }
];

// GET /api/timetable/:semester
router.get('/timetable/:semester', (req, res) => {
    const sem = decodeURIComponent(req.params.semester);
    res.json(TIMETABLE[sem] || null);
});

// GET /api/faculty-timetable
router.get('/faculty-timetable', (req, res) => {
    res.json(FACULTY_TIMETABLE);
});

// ============================================================
// REMINDERS
// ============================================================
// GET /api/reminders?facultyId=xxx
router.get('/reminders', async (req, res) => {
    try {
        const { facultyId } = req.query;
        const query = facultyId ? { facultyId } : {};
        const reminders = await Reminder.find(query).sort({ date: 1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/reminders
router.post('/reminders', async (req, res) => {
    try {
        const reminder = new Reminder(req.body);
        await reminder.save();
        res.status(201).json({ success: true, reminder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/reminders/:id
router.delete('/reminders/:id', async (req, res) => {
    try {
        await Reminder.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
// CHAT
// ============================================================
// GET /api/chat/:chatKey
router.get('/chat/:chatKey', async (req, res) => {
    try {
        const messages = await ChatMessage.find({ chatKey: req.params.chatKey }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/:chatKey
router.post('/chat/:chatKey', async (req, res) => {
    try {
        const message = new ChatMessage({
            chatKey: req.params.chatKey,
            from: req.body.from,
            text: req.body.text,
            timestamp: new Date()
        });
        await message.save();
        res.status(201).json({ success: true, message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
