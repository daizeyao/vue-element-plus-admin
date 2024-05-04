const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/'
    fs.readdir(dir, (err, files) => {
      if (err) throw err
      for (const file of files) {
        fs.unlink(path.join(dir, file), (err) => {
          if (err) throw err
        })
      }
    })
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const filePath = path.join(file.fieldname + file.originalname)
    cb(null, filePath)
  }
})

const upload = multer({ storage: storage }).single('file')

module.exports = async (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // 发生Multer错误时
      return res.status(500).json(err)
    } else if (err) {
      // 发生未知错误时
      return res.status(500).json(err)
    }
    // 一切都好，返回文件信息
    return res.status(200).json(req.file)
  })
}
