const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },       // Employee ID e.g. 10001
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    subjects: [String],
    password: { type: String, required: true },
    phone: String,
    designation: String,
    active: { type: Boolean, default: true },
    classes: [{
        section: String,
        subject: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
