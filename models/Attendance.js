const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    semester: { type: String, required: true },           // e.g. "Semester 3"
    subject: { type: String, required: true },            // Subject name
    code: String,                                          // Subject code
    attendedDates: [String],
    missedDates: [String]
}, { timestamps: true });

// Compound index for efficient lookups
attendanceSchema.index({ studentId: 1, semester: 1 });
attendanceSchema.index({ studentId: 1, semester: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
