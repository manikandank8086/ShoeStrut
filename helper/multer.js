  const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + 'product' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + 'img' + uniqueSuffix);
  }
});

const upload = multer({ storage: storage });

module.exports = { upload };



 