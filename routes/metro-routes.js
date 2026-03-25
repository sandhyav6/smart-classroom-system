// ============================================================
// routes/metro-routes.js — Route CRUD with full validation
// Mounted at /api/routes in server.js
// ============================================================
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const Route    = require('../models/Route');

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
    console.error('Routes route error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}

// ── POST /api/routes — Create route ──────────────────────────
router.post('/', async (req, res) => {
    const { fromStation, toStation, distance, time } = req.body;

    if (!fromStation) return res.status(400).json({ error: 'fromStation ID is required' });
    if (!toStation)   return res.status(400).json({ error: 'toStation ID is required' });
    if (!isValidId(fromStation)) return res.status(400).json({ error: 'fromStation must be a valid MongoDB ObjectId' });
    if (!isValidId(toStation))   return res.status(400).json({ error: 'toStation must be a valid MongoDB ObjectId' });
    if (fromStation === toStation) return res.status(400).json({ error: 'fromStation and toStation cannot be the same' });

    if (distance == null || distance === '') return res.status(400).json({ error: 'Distance is required' });
    if (isNaN(Number(distance)) || Number(distance) < 0) return res.status(400).json({ error: 'Distance must be a non-negative number' });
    if (Number(distance) > 5000) return res.status(400).json({ error: 'Distance seems too large (max 5000 km)' });

    if (time == null || time === '') return res.status(400).json({ error: 'Travel time is required' });
    if (isNaN(Number(time)) || Number(time) < 0) return res.status(400).json({ error: 'Time must be a non-negative number' });
    if (Number(time) > 10000) return res.status(400).json({ error: 'Travel time seems too large (max 10000 min)' });

    try {
        const route = new Route({
            fromStation, toStation,
            distance: Number(distance),
            time:     Number(time)
        });
        await route.save();
        res.status(201).json({ success: true, route });
    } catch (err) { handleError(res, err); }
});

// ── GET /api/routes — List all ───────────────────────────────
router.get('/', async (req, res) => {
    try {
        const routes = await Route.find()
            .populate('fromStation', 'stationName line')
            .populate('toStation',   'stationName line')
            .sort({ createdAt: -1 });
        res.json(routes);
    } catch (err) { handleError(res, err); }
});

// ── GET /api/routes/:id ──────────────────────────────────────
router.get('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid route ID format' });
    try {
        const route = await Route.findById(req.params.id)
            .populate('fromStation', 'stationName line')
            .populate('toStation',   'stationName line');
        if (!route) return res.status(404).json({ error: 'Route not found' });
        res.json(route);
    } catch (err) { handleError(res, err); }
});

// ── DELETE /api/routes/:id ───────────────────────────────────
router.delete('/:id', async (req, res) => {
    if (!isValidId(req.params.id))
        return res.status(400).json({ error: 'Invalid route ID format' });
    try {
        const route = await Route.findByIdAndDelete(req.params.id);
        if (!route) return res.status(404).json({ error: 'Route not found' });
        res.json({ success: true, message: 'Route deleted' });
    } catch (err) { handleError(res, err); }
});

module.exports = router;
