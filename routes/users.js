// ============================================================
// routes/users.js — User CRUD with full validation
// ============================================================
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const User     = require('../models/User');

// ── Helpers ──────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidId(id) { return mongoose.Types.ObjectId.isValid(id); }

function handleError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(409).json({ error: `A user with this ${field} already exists` });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Users route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}

// ── POST /api/users — Create user ────────────────────────────
router.post('/', async (req, res) => {
    const name  = (req.body.name  || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();

    if (!name)              return res.status(400).json({ error: 'Name is required' });
    if (name.length < 2)    return res.status(400).json({ error: 'Name must be at least 2 characters' });
    if (name.length > 100)  return res.status(400).json({ error: 'Name must not exceed 100 characters' });
    if (!email)             return res.status(400).json({ error: 'Email is required' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Invalid email address format' });

    try {
        const user = new User({ name, email });
        await user.save();
        res.status(201).json({ success: true, user });
    } catch (err) { handleError(res, err); }
});

// ── GET /api/users — List all users ──────────────────────────
router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { handleError(res, err); }
});

// ── GET /api/users/:id — Single user ─────────────────────────
router.get('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid user ID format' });
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) { handleError(res, err); }
});

// ── DELETE /api/users/:id — Delete user ──────────────────────
router.delete('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid user ID format' });
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) { handleError(res, err); }
});

module.exports = router;
