const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: String,
    facultyId: { type: String, required: true }
}, { timestamps: true });

reminderSchema.index({ facultyId: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
