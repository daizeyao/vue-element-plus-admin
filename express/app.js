const express = require('express')
const cors = require('cors')
const { connectDB } = require('./connect.js')
const sendCode = require('./sendCode.js')
const login = require('./login.js')
const register = require('./register.js')
const upload = require('./upload.js')
const encode = require('./encode.js')
const decode = require('./decode.js')
const app = express()

connectDB()

app.use(
  cors({
    exposedHeaders: ['Content-Disposition', 'Content-Type']
  })
)
app.use(express.json())

app.post('/api/sendCode', sendCode)
app.post('/api/login', login)
app.post('/api/register', register)
app.post('/api/upload', upload)
app.post('/api/encode', encode)
app.post('/api/decode', decode)

app.listen(3006, () => {
  console.log('后端服务已启动')
})
