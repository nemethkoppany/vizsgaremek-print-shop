import multer from "multer";
import util from "util";
import config from "./config";

// Fájlok tárolása
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.baseDir + config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Egy fájl
const uploadSingle = multer({
  storage,
  limits: { fileSize: config.maxSize },
}).single("file");

// Több fájl (max 20)
const uploadMultiple = multer({
  storage,
  limits: { fileSize: config.maxSize },
}).array("files", 20);

export const uploadMiddleware = util.promisify(uploadSingle);
export const uploadMiddlewareMultiple = util.promisify(uploadMultiple);
