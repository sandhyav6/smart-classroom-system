// ============================================================
// routes/auth.js — Authentication endpoints
// ============================================================
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// POST /api/auth/student-login
router.post('/student-login', async (req, res) => {
    try {
        const { regNo, password } = req.body;
        if (!regNo || !password) {
            return res.status(400).json({ error: 'Registration number and password are required' });
        }

        const student = await Student.findOne({ id: regNo.toUpperCase() });
        if (!student) {
            return res.status(404).json({ error: 'Student not found', exists: false });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password', exists: true });
        }

        // Set session
        req.session.user = {
            role: 'student',
            id: student.id,
            name: student.name,
            firstName: student.firstName,
            department: student.department,
            semester: student.semester,
            cgpa: student.cgpa
        };

        req.session.save(err => {
            if (err) {
                return res.status(500).json({ error: 'Session save failed' });
            }
            res.json({
                success: true,
                user: req.session.user
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// POST /api/auth/faculty-login
router.post('/faculty-login', async (req, res) => {
    try {
        const { empId, password } = req.body;
        if (!empId || !password) {
            return res.status(400).json({ error: 'Employee ID and password are required' });
        }

        const faculty = await Faculty.findOne({ id: empId });
        if (!faculty) {
            return res.status(404).json({ error: 'Faculty not found', exists: false });
        }

        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password', exists: true });
        }

        // Set session
        req.session.user = {
            role: 'faculty',
            id: faculty.id,
            name: faculty.name,
            department: faculty.department,
            subjects: faculty.subjects
        };

        res.json({
            success: true,
            user: req.session.user
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// GET /api/auth/session
router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ success: true });
    });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const emailLower = email.trim().toLowerCase();

        // Look up in Student collection
        const student = await Student.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
        if (student) {
            console.log(`📧 [SIMULATED EMAIL] Password reset link sent to ${emailLower} (Student: ${student.name}, ID: ${student.id})`);
            console.log(`   Reset token: SIMULATED-${Date.now()}`);
            return res.json({
                success: true,
                message: 'Password reset link has been sent to your email.',
                role: 'student'
            });
        }

        // Look up in Faculty collection
        const faculty = await Faculty.findOne({ email: { $regex: new RegExp(`^${emailLower}$`, 'i') } });
        if (faculty) {
            console.log(`📧 [SIMULATED EMAIL] Password reset link sent to ${emailLower} (Faculty: ${faculty.name}, ID: ${faculty.id})`);
            console.log(`   Reset token: SIMULATED-${Date.now()}`);
            return res.json({
                success: true,
                message: 'Password reset link has been sent to your email.',
                role: 'faculty'
            });
        }

        // Not found
        return res.status(404).json({ error: 'No account found with this email address.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

module.exports = router;
