const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    assignmentId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    course: { type: String, required: true },
    courseCode: String,
    dueDate: { type: String, required: true },
    shortDescription: String,
    detailedDescription: String,
    createdBy: String,                // Faculty ID
    maxMarks: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
