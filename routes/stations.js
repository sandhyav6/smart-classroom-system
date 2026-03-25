// ============================================================
// routes/stations.js — Station CRUD with full validation
// ============================================================
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const Station  = require('../models/Station');

// ── Helpers ──────────────────────────────────────────────────
function isValidId(id) { return mongoose.Types.ObjectId.isValid(id); }

function handleError(res, err) {
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Stations route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}

// ── POST /api/stations — Create station ──────────────────────
router.post('/', async (req, res) => {
    const stationName = (req.body.stationName || '').trim();
    const line        = (req.body.line        || '').trim();
    const location    = req.body.location;

    if (!stationName)             return res.status(400).json({ error: 'Station name is required' });
    if (stationName.length < 2)   return res.status(400).json({ error: 'Station name must be at least 2 characters' });
    if (stationName.length > 100) return res.status(400).json({ error: 'Station name must not exceed 100 characters' });
    if (!line)                    return res.status(400).json({ error: 'Metro line is required' });
    if (line.length > 60)         return res.status(400).json({ error: 'Line name must not exceed 60 characters' });

    if (location) {
        const { lat, lng } = location;
        if (lat != null && (isNaN(lat) || lat < -90  || lat > 90))
            return res.status(400).json({ error: 'Latitude must be between -90 and 90' });
        if (lng != null && (isNaN(lng) || lng < -180 || lng > 180))
            return res.status(400).json({ error: 'Longitude must be between -180 and 180' });
    }

    try {
        const station = new Station({ stationName, line, location });
        await station.save();
        res.status(201).json({ success: true, station });
    } catch (err) { handleError(res, err); }
});

// ── GET /api/stations — List all (optional ?line= filter) ────
router.get('/', async (req, res) => {
    try {
        const filter = req.query.line
            ? { line: new RegExp(req.query.line.trim(), 'i') }
            : {};
        const stations = await Station.find(filter).sort({ stationName: 1 });
        res.json(stations);
    } catch (err) { handleError(res, err); }
});

// ── GET /api/stations/:id ────────────────────────────────────
router.get('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid station ID format' });
    try {
        const station = await Station.findById(req.params.id);
        if (!station) return res.status(404).json({ error: 'Station not found' });
        res.json(station);
    } catch (err) { handleError(res, err); }
});

// ── DELETE /api/stations/:id ─────────────────────────────────
router.delete('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid station ID format' });
    try {
        const station = await Station.findByIdAndDelete(req.params.id);
        if (!station) return res.status(404).json({ error: 'Station not found' });
        res.json({ success: true, message: 'Station deleted' });
    } catch (err) { handleError(res, err); }
});

module.exports = router;
