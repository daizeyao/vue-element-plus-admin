const express = require('express')
const cors = require('cors')
const { connectDB } = require('./connect.js')
const sendCode = require('./sendCode.js')
const login = require('./login.js')
const register = require('./register.js')
const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.post('/sendCode', sendCode)
app.post('/login', login)
app.post('/register', register)

app.listen(3006, () => {
  console.log('后端服务已启动')
})
