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

async function sendCode(req, res) {
  const email = req.body.email
  const emailcode = String(Math.floor(Math.random() * 1000000)).padEnd(6, '0')
  const mail = {
    from: `"欢迎使用文件加密系统"<1192313493@qq.com>`,
    subject: '验证码',
    to: email,
    html: `
            <p>您好！</p>
            <p>您的验证码是：<strong style="color:orangered;">${emailcode}</strong></p>
            <p>如果不是您本人操作，请无视此邮件</p>
        `
  }
  await nodeMail.sendMail(mail, (err, info) => {
    if (!err) {
      res.send({
        code: 200,
        message: '发送成功',
        data: { emailcode: emailcode }
      })
    } else {
      res.send({
        code: 500,
        message: '发送失败',
        data: { emailcode: emailcode }
      })
    }
  })
}

module.exports = sendCode
