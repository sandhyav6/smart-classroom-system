const mongoose = require('mongoose');

// Stores one document per (semester × section) combination
// schedule is a nested object: { timeSlot: { day: { code, name, faculty, facultyId, location } } }
const timetableSchema = new mongoose.Schema({
    semester: { type: String, required: true },   // e.g. "Semester 1"
    section:  { type: String, required: true },   // "A", "B", or "C"
    schedule: { type: mongoose.Schema.Types.Mixed, required: true }
    // shape: { '09:00 - 09:50': { Mon: {code,name,faculty,facultyId,location}|null, Tue:..., } }
}, { timestamps: true });

timetableSchema.index({ semester: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
