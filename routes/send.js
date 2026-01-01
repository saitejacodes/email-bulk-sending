const express = require('express')
const Email = require('../models/email')
const router = express.Router()
router.post('/send', async (req, res) => {
const subject = req.body.subject
const body = req.body.body
const recipients = req.body.recipients
if (!subject || !body || !recipients || recipients.length === 0) {
res.status(400).json({ error: 'subject, body, and recipients array are required' })
return
}
if (!Array.isArray(recipients)) {
res.status(400).json({ error: 'recipients must be an array' })
return
}
const docs = []
for (let i = 0; i < recipients.length; i++) {
if (!recipients[i] || typeof recipients[i] !== 'string') {
res.status(400).json({ error: `invalid email at index ${i}` })
return
}
docs.push({
email: recipients[i],
subject: subject,
body: body,
status: 'PENDING',
attempts: 0,
lastError: null,
sentAt: null
})
}
const insertResult = await Email.insertMany(docs)
if (!insertResult || insertResult.length === 0) {
res.status(500).json({ error: 'failed to queue emails' })
return
}
res.status(201).json({
success: true,
queued: recipients.length,
message: `${recipients.length} emails queued for sending`
})
})
router.get('/stats', async (req, res) => {
const pending = await Email.countDocuments({ status: 'PENDING' })
const sent = await Email.countDocuments({ status: 'SENT' })
const failed = await Email.countDocuments({ status: 'FAILED' })
res.json({
pending: pending,
sent: sent,
failed: failed,
total: pending + sent + failed
})
})
module.exports = router

