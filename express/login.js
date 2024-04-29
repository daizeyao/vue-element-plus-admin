const crypto = require('crypto')
const { db } = require('./connect.js')

async function login(req, res) {
  const { username, password } = req.body

  const query = 'SELECT * FROM users WHERE username = ?'
  db.query(query, [username], handleQueryResult)

  function handleQueryResult(err, rows) {
    if (err) {
      // 处理错误
      console.log(err)
      res.send({
        code: 500,
        data: { success: 0, message: '服务器错误' }
      })
    } else {
      if (rows.length > 0) {
        const salt = rows[0].salt
        // 使用SHA256哈希密码和盐值
        const hash = crypto.createHash('sha256')
        hash.update(password + salt)
        const hashedPassword = hash.digest('hex')
        if (rows[0].hashed_password === hashedPassword) {
          res.send({
            code: 200,
            message: '登录成功',
            data: {
              username: username,
              password: password,
              role: rows[0].role,
              permissions: ['*.*.*']
            }
          })
        } else {
          res.send({ code: 401, message: '用户名或密码错误' })
        }
      } else {
        res.send({ code: 401, message: '用户名不存在' })
      }
    }
  }
}

module.exports = login
