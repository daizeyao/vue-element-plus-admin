const crypto = require('crypto')
const { db } = require('./connect.js')

async function register(req, res) {
  const { username, password, email } = req.body

  // 首先检查用户名是否已存在
  const checkQuery = 'SELECT * FROM users WHERE username = ?'
  db.query(checkQuery, [username], (err, result) => {
    if (err) {
      console.log(err)
      res.send({
        code: 500,
        data: { success: 0, message: '服务器错误' }
      })
    } else if (result.length > 0) {
      res.send({
        code: 409,
        message: '用户名已存在'
      })
    } else {
      // 生成随机盐值
      const salt = crypto.randomBytes(16).toString('hex')

      // 使用SHA256哈希密码和盐值
      const hash = crypto.createHash('sha256')
      hash.update(password + salt)
      const hashedPassword = hash.digest('hex')

      const query =
        'INSERT INTO users (username, email, salt, hashed_password, role) VALUES (?, ?, ?, ?, "guest")'
      db.query(query, [username, email, salt, hashedPassword], handleQueryResult)
    }
  })

  function handleQueryResult(err, result) {
    if (err) {
      // 处理错误
      console.log(err)
      res.send({
        code: 500,
        data: { success: 0, message: '服务器错误' }
      })
    } else {
      res.send({
        code: 200,
        message: '注册成功'
      })
    }
  }
}

module.exports = register
