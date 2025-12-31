const express = require('express')
const Email = require('../models/email')
const router = express.Router()
router.post('/send', async (req, res) => {
const subject = req.body.subject
const body = req.body.body
const recipients = req.body.recipients
if (!subject||!body||!recipients||recipients.length == 0) {
res.status(400).json({error:'missing fields'})
return
}
const docs = []
for (let i=0;i<recipients.length;i++) {
docs.push({
email:recipients[i],
subject:subject,
body:body,
status:'PENDING'
})
}
await Email.insertMany(docs)
res.json({queued:recipients.length })
})
module.exports=router

