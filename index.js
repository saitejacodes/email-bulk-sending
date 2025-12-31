const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const sendRoutes = require('./routes/send')
const app = express()
const PORT = process.env.PORT||3000
app.use(express.json())
mongoose.connect(process.env.MONGODB_URI).then(() => {
console.log('connected')
}).catch(err=>{
console.log('db error',err)
})
app.use('/', sendRoutes)
app.listen(PORT,()=>{
console.log('running on'+ PORT)
})
