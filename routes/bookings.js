// ============================================================
// routes/bookings.js — Booking CRUD with full validation
// ============================================================
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const Booking  = require('../models/Booking');

// ── Helpers ──────────────────────────────────────────────────
function isValidId(id) { return mongoose.Types.ObjectId.isValid(id); }

function handleError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID — make sure you used a valid MongoDB ObjectId' });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Bookings route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}

// ── POST /api/bookings — Create booking ──────────────────────
router.post('/', async (req, res) => {
    const { user, fromStation, toStation, date, fare } = req.body;

    if (!user)        return res.status(400).json({ error: 'User ID is required' });
    if (!fromStation) return res.status(400).json({ error: 'From-station ID is required' });
    if (!toStation)   return res.status(400).json({ error: 'To-station ID is required' });

    if (!isValidId(user))        return res.status(400).json({ error: 'user must be a valid MongoDB ObjectId' });
    if (!isValidId(fromStation)) return res.status(400).json({ error: 'fromStation must be a valid MongoDB ObjectId' });
    if (!isValidId(toStation))   return res.status(400).json({ error: 'toStation must be a valid MongoDB ObjectId' });

    if (fromStation === toStation)
        return res.status(400).json({ error: 'From-station and to-station cannot be the same' });

    if (fare == null || fare === '')
        return res.status(400).json({ error: 'Fare is required' });
    if (isNaN(Number(fare)) || Number(fare) < 0)
        return res.status(400).json({ error: 'Fare must be a non-negative number' });
    if (Number(fare) > 10000)
        return res.status(400).json({ error: 'Fare seems too high (max ₹10000)' });

    if (date) {
        const parsed = new Date(date);
        if (isNaN(parsed.getTime()))
            return res.status(400).json({ error: 'Invalid date format' });
    }

    try {
        const booking = new Booking({
            user, fromStation, toStation,
            date: date ? new Date(date) : Date.now(),
            fare: Number(fare)
        });
        await booking.save();
        res.status(201).json({ success: true, booking });
    } catch (err) { handleError(res, err); }
});

// ── GET /api/bookings — List all ─────────────────────────────
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user',        'name email')
            .populate('fromStation', 'stationName line')
            .populate('toStation',   'stationName line')
            .sort({ date: -1 });
        res.json(bookings);
    } catch (err) { handleError(res, err); }
});

// ── GET /api/bookings/:id ────────────────────────────────────
router.get('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid booking ID format' });
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user',        'name email')
            .populate('fromStation', 'stationName line')
            .populate('toStation',   'stationName line');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking);
    } catch (err) { handleError(res, err); }
});

// ── DELETE /api/bookings/:id ─────────────────────────────────
router.delete('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid booking ID format' });
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        res.json({ success: true, message: 'Booking deleted' });
    } catch (err) { handleError(res, err); }
});

module.exports = router;
