const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    stationName: { type: String, required: true, trim: true },
    line:        { type: String, required: true, trim: true },  // e.g. 'Blue Line', 'Red Line'
    location: {
        lat:  { type: Number },
        lng:  { type: Number }
    }
}, { timestamps: true });

// Text index for search
stationSchema.index({ stationName: 'text', line: 'text' });

module.exports = mongoose.model('Station', stationSchema);
