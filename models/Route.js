const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    fromStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    toStation:   { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    distance:    { type: Number, required: true, min: 0 },   // in kilometres
    time:        { type: Number, required: true, min: 0 }    // in minutes
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
