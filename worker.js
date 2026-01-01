const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const Email = require('./models/email')
require('dotenv').config()
const MAX_ATTEMPTS = 3
const BATCH_SIZE = 50
const BATCH_DELAY = 1000
const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: process.env.SMTP_PORT,
secure: false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS
}
})
const connectDB = async () => {
await mongoose.connect(process.env.MONGODB_URI)
console.log('[Worker] Connected to MongoDB')
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const processPendingEmails = async () => {
const batch = await Email.find({
status: 'PENDING',
attempts: { $lt: MAX_ATTEMPTS }
}).limit(BATCH_SIZE)
if (batch.length === 0) return
console.log(`[Batch] Processing ${batch.length} emails...`)
for (let i = 0; i < batch.length; i++) {
const item = batch[i]
if (item.status !== 'PENDING') continue
if (item.attempts >= MAX_ATTEMPTS) {
item.status = 'FAILED'
item.lastError = 'max attempts exceeded'
await item.save()
console.log(`[FAILED] ${item.email} - max attempts exceeded`)
continue
}
const mailOptions = {
from: process.env.FROM_EMAIL,
to: item.email,
subject: item.subject,
text: item.body
}
let sendSuccess = false
let sendError = null
await transporter.sendMail(mailOptions).then(() => {
sendSuccess = true
}).catch(err => {
sendError = err
})
if (sendSuccess) {
item.status = 'SENT'
item.sentAt = new Date()
item.attempts = item.attempts + 1
item.lastError = null
await item.save()
console.log(`[SENT] ${item.email} (attempts: ${item.attempts})`)
} else {
item.attempts = item.attempts + 1
if (item.attempts >= MAX_ATTEMPTS) {
item.status = 'FAILED'
item.lastError = sendError ? sendError.message : 'unknown error'
console.log(`[FAILED] ${item.email} (attempts: ${item.attempts}/${MAX_ATTEMPTS}) - ${item.lastError}`)
} else {
item.status = 'PENDING'
console.log(`[RETRY] ${item.email} (attempts: ${item.attempts}/${MAX_ATTEMPTS})`)
}
await item.save()
}
}
console.log(`[Batch] Completed. Waiting ${BATCH_DELAY}ms before next batch...`)
await sleep(BATCH_DELAY)
}
const start = async () => {
await connectDB()
console.log('[Worker] Started. Processing emails every 10 seconds.')
console.log(`[Config] Max attempts: ${MAX_ATTEMPTS}, Batch size: ${BATCH_SIZE}`)
setInterval(processPendingEmails, 10000)
}
start()
