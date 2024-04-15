const express = require('express')
const cors = require('cors')
const sendCode = require('./sendCode.js')
const app = express()

app.use(cors())
app.use(express.json())

app.post('/api/email', sendCode)

app.listen(3006, () => {
  console.log('邮件发送服务开启成功')
})
