const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    semester: { type: String, required: true },
    subject: { type: String, required: true },
    module: { type: String, default: 'General' },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileType: String,
    fileSize: Number,
    uploadedBy: String,
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

materialSchema.index({ semester: 1, subject: 1, module: 1 });

module.exports = mongoose.model('Material', materialSchema);
