// ============================================================
// routes/students.js — Student CRUD endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// GET /api/students — List all (with optional search query)
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let students;
        if (q) {
            const regex = new RegExp(q, 'i');
            students = await Student.find({
                $or: [
                    { name: regex },
                    { id: regex },
                    { department: regex }
                ]
            }).select('-password');
        } else {
            students = await Student.find().select('-password');
        }
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/students/section/:section — Get students by section
router.get('/section/:section', async (req, res) => {
    try {
        const section = req.params.section;
        let query = {};

        if (section === 'CSE-2A') query = { section: 'A', department: 'CSE' };
        else if (section === 'CSE-2B') query = { section: 'B', department: 'CSE' };
        else if (section === 'CSE-3A') query = { section: 'C', department: 'CSE' };
        else return res.json([]);

        const students = await Student.find(query).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/students/:id — Get single student by registration number
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.params.id }).select('-password');
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/students — Create new student
router.post('/', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const data = req.body;
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        const student = new Student(data);
        await student.save();
        res.status(201).json({ success: true, student: { ...student.toObject(), password: undefined } });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'Student with this ID already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/students/:id — Update student
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;
        if (updates.password) {
            const bcrypt = require('bcryptjs');
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        const student = await Student.findOneAndUpdate(
            { id: req.params.id },
            { $set: updates },
            { new: true }
        ).select('-password');

        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/students/:id — Delete student
router.delete('/:id', async (req, res) => {
    try {
        const student = await Student.findOneAndDelete({ id: req.params.id });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Clean up related data
        const Attendance = require('../models/Attendance');
        const Marks = require('../models/Marks');
        const Submission = require('../models/Submission');
        await Attendance.deleteMany({ studentId: req.params.id });
        await Marks.deleteMany({ studentId: req.params.id });
        await Submission.deleteMany({ studentId: req.params.id });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
