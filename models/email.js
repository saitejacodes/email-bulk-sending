const mongoose = require('mongoose')
const schema = new mongoose.Schema({
email: { type: String, required: true },
subject: { type: String, required: true },
body: { type: String, required: true },
status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
attempts: { type: Number, default: 0 },
lastError: { type: String, default: null },
sentAt: { type: Date, default: null },
createdAt: { type: Date, default: Date.now }
})
schema.index({ status: 1, attempts: 1 })
const Email = mongoose.model('Email', schema)
module.exports = Email
