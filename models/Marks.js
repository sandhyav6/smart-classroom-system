const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    semester: { type: String, required: true },            // e.g. "Semester 3"
    code: { type: String, required: true },                // Subject code
    name: { type: String, required: true },                // Subject name
    da1: { type: Number, default: 0 },
    da2: { type: Number, default: 0 },
    da3: { type: Number, default: 0 },
    internal: { type: Number, default: 0 },
    cat1: { type: Number, default: 0 },
    cat2: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    grade: { type: String, default: 'N' },
    remarks: { type: String, default: '' },
    status: { type: String, default: 'Pass' }
}, { timestamps: true });

marksSchema.index({ studentId: 1, semester: 1 });
marksSchema.index({ studentId: 1, semester: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
