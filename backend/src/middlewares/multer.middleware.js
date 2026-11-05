import multer from "multer";
import path from "path";
import fs from "fs";
import { isCloudinaryEnabled } from "../helpers/storage.helper.js";

const uploadDir = "uploads";

// Con Cloudinary el archivo se deja en memoria (req.file.buffer) y luego
// storage.helper.js lo sube a la nube. Sin Cloudinary se guarda en disco.
const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de archivo no válido. Solo se permiten imágenes (JPEG, JPG, PNG, WEBP)"), false);
  }
};

const upload = multer({
  storage: isCloudinaryEnabled ? memoryStorage : diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
