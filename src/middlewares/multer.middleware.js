import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // 🧠 Rename file: fieldname + timestamp + original extension
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

// multer({ storage }) → tells Multer to use that diskStorage strategy
//   instead of the default (which just dumps files with random names)

const upload = multer({ storage });

export { upload };