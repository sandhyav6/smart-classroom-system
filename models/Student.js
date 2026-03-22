const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },      // Registration number e.g. 21BCE0001
    name: { type: String, required: true },
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, enum: ['A', 'B', 'C'] },
    cgpa: { type: Number, min: 0, max: 10 },
    password: { type: String, required: true },
    phone: String,
    joinYear: Number,
    active: { type: Boolean, default: true }
}, { timestamps: true });

// Index for search
studentSchema.index({ name: 'text', id: 'text', department: 'text' });

module.exports = mongoose.model('Student', studentSchema);
