const multer = require('multer')
const path = require('path');
var fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    var dir = `./public/img/${req.params.id}`;

    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

    cb(null, dir + '/')
  },
  filename: function (req, file, cb) {
    if (path.extname(file.originalname) === '.jpg' || path.extname(file.originalname) === '.gif' || path.extname(file.originalname) === '.png'){
      cb(null, Date.now() + '-' + file.originalname);
    }
  }
});

const upload = multer({
  storage,
  limits: {fieldSize: 10000}
})



module.exports = {upload}