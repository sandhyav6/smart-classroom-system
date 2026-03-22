const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    chatKey: { type: String, required: true },     // e.g. "21BCE0001_10001"
    from: { type: String, required: true },         // 'student' or 'teacher'
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

chatMessageSchema.index({ chatKey: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
