const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
    fromStation: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    toStation:   { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    date:        { type: Date,   required: true, default: Date.now },
    fare:        { type: Number, required: true, min: 0 }   // in currency units (e.g. INR)
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
