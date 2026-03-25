// ============================================================
// routes/reminders.js — Reminder management endpoints
// Faculty can create, read, and delete reminders
// ============================================================

const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// GET /api/reminders?facultyId=10001 — Get all reminders for a faculty
router.get('/', async (req, res) => {
    try {
        const { facultyId } = req.query;
        
        let filter = {};
        if (facultyId) {
            filter.facultyId = facultyId;
        }

        const reminders = await Reminder.find(filter).sort({ date: 1 });
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/reminders/:id — Get single reminder
router.get('/:id', async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        res.json(reminder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/reminders — Create new reminder
router.post('/', async (req, res) => {
    try {
        const { title, date, description, facultyId } = req.body;

        if (!title || !date || !facultyId) {
            return res.status(400).json({ error: 'title, date, and facultyId are required' });
        }

        const reminder = new Reminder({
            title,
            date,
            description: description || '',
            facultyId
        });

        await reminder.save();
        res.status(201).json({ success: true, reminder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/reminders/:id — Update reminder
router.put('/:id', async (req, res) => {
    try {
        const { title, date, description } = req.body;

        const reminder = await Reminder.findByIdAndUpdate(
            req.params.id,
            { title, date, description },
            { new: true }
        );

        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({ success: true, reminder });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/reminders/:id — Delete reminder
router.delete('/:id', async (req, res) => {
    try {
        const reminder = await Reminder.findByIdAndDelete(req.params.id);
        if (!reminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
