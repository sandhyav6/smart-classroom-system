const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    assignmentId: { type: Number, required: true },
    file: String,
    date: String,
    status: { type: String, default: 'submitted' }
}, { timestamps: true });

submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
