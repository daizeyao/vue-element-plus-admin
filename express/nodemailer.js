const nodemailer = require('nodemailer')

const nodeMail = nodemailer.createTransport({
  service: 'qq',
  port: 465,
  secure: true,
  auth: {
    user: '1192313493@qq.com',
    pass: 'ofymhdpjujimhgcd'
  }
})

module.exports = nodeMail
