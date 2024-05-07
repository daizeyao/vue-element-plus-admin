const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const os = require('os')

async function decode(req, res) {
  const { key } = req.body
  // 假设 'uploads' 文件夹中只有一个文件
  const directoryPath = path.join(__dirname, '../uploads')
  // const decodePath = path.join(__dirname, '../cpp/AES_CBC.exe')
  const decodePath = os.platform() === 'win32' ? './cpp/AES_CBC.exe' : './cpp/AES_CBC'
  const files = fs.readdirSync(directoryPath)
  // 检查文件是否存在
  if (files.length > 0) {
    const filePath = path.join(directoryPath, files[0])
    // console.log(filePath)
    const command =
      os.platform() === 'win32'
        ? `${decodePath} 0 ${key} ${filePath}`
        : `./${decodePath} 0 ${key} ${filePath}`
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // console.error(`执行加密出错: ${error}`)
        res.set('Content-Type', 'application/json') // 设置Content-Type为application/json
        res.send({ code: 500, message: `执行解密出错: ${error}` })
        return
      }
      if (stderr) {
        res.set('Content-Type', 'application/json') // 设置Content-Type为application/json
        res.send({ code: 500, message: `执行解密出错: ${stderr}` })
        return
      }
      // console.log(`stdout: ${stdout}`)
      // console.error(`stderr: ${stderr}`)
      const newFilePath = path.join(directoryPath, stdout.trim()) // 假设stdout是新的文件名

      res.set('Content-Type', 'application/octet-stream') // 设置Content-Type为application/octet-stream
      res.set('Content-Disposition', 'attachment; filename=' + path.basename(newFilePath)) // 添加文件名到响应头
      res.download(newFilePath) // 发送文件并在浏览器中触发下载
    })
  } else {
    res.set('Content-Type', 'application/json') // 设置Content-Type为application/json
    res.send({ code: 404, message: '文件不存在' })
  }
}

module.exports = decode
