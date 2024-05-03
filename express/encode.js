const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

async function encode(req, res) {
  const { key } = req.body
  // 假设 'uploads' 文件夹中只有一个文件
  const directoryPath = path.join(__dirname, '../uploads')
  const files = fs.readdirSync(directoryPath)
  // 检查文件是否存在
  if (files.length > 0) {
    const filePath = path.join(directoryPath, files[0])
    res.set('Content-Disposition', 'attachment; filename=' + path.basename(filePath)) // 添加文件名到响应头
    res.download(filePath) // 发送文件并在浏览器中触发下载
  } else {
    res.send({ code: 404, message: '文件不存在' })
  }
}

module.exports = encode
