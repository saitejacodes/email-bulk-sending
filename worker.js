const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const Email = require('./models/email')
require('dotenv').config()
const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: process.env.SMTP_PORT,
secure: false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS
}
})
const connectDB=async()=>{
await mongoose.connect(process.env.MONGODB_URI)
console.log('worker connected')
}
const processPendingEmails=async()=>{
const list=await Email.find({status:'PENDING'}).limit(50)
if (list.length===0) return
for (let item of list) {
await transporter.sendMail({
from:process.env.FROM_EMAIL,
to:item.email,
subject:item.subject,
text:item.body
})
item.status='SENT'
await item.save()
console.log('sentto'+ item.email)
}
}
const start=async()=>{
await connectDB()
console.log('worker running')
setInterval(processPendingEmails,5000)
}
start()
