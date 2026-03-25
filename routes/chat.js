// ============================================================
// routes/chat.js — Real-time Chat API
//
// chatKey format: "{studentId}_{facultyId}"
//   e.g. "21BCE0001_10001"
//
// GET  /api/chat/:chatKey            — fetch all messages (optionally ?after=timestamp)
// POST /api/chat/:chatKey            — post a new message
// GET  /api/chat/conversations/:userId — list unique chat partners for a user
// ============================================================
const express     = require('express');
const router      = express.Router();
const ChatMessage = require('../models/ChatMessage');

// ── Helpers ──────────────────────────────────────────────────
function handleError(res, err) {
    console.error('Chat route error:', err);
    res.status(500).json({ error: 'Internal server error' });
}

// ── GET /api/chat/:chatKey — Fetch messages ───────────────────
// Optional: ?after=ISO-timestamp  to fetch only new messages (for polling)
router.get('/:chatKey', async (req, res) => {
    try {
        const { chatKey } = req.params;
        const { after }   = req.query;

        const filter = { chatKey };
        if (after) {
            const since = new Date(after);
            if (!isNaN(since)) filter.timestamp = { $gt: since };
        }

        const messages = await ChatMessage
            .find(filter)
            .sort({ timestamp: 1 })
            .lean();

        res.json(messages);
    } catch (err) { handleError(res, err); }
});

// ── POST /api/chat/:chatKey — Send a message ─────────────────
router.post('/:chatKey', async (req, res) => {
    try {
        const { chatKey } = req.params;
        const { from, text } = req.body;

        if (!from || !['student', 'teacher'].includes(from))
            return res.status(400).json({ error: '"from" must be "student" or "teacher"' });
        if (!text || !text.trim())
            return res.status(400).json({ error: 'Message text is required' });

        const msg = new ChatMessage({ chatKey, from, text: text.trim() });
        await msg.save();
        res.status(201).json(msg);
    } catch (err) { handleError(res, err); }
});

// ── GET /api/chat/conversations/:userId — List chat threads ──
// Returns all unique chatKeys that involve this userId
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // chatKey is "studentId_facultyId"; userId may appear in either half
        const regex = new RegExp(`(^|_)${userId}(_|$)`);
        const keys  = await ChatMessage.distinct('chatKey', { chatKey: regex });
        res.json(keys);
    } catch (err) { handleError(res, err); }
});

module.exports = router;
