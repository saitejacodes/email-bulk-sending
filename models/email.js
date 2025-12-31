const mongoose = require('mongoose')
const schema = new mongoose.Schema({
email: { type: String,required: true },
subject: { type: String,required: true },
body: { type: String,required: true },
status: { type: String,enum:['PENDING', 'SENT'],default:'PENDING' },
createdAt: { type: Date,default: Date.now }
})
const Email = mongoose.model('Email', schema)
module.exports = Email
