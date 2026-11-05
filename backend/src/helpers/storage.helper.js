import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Si están las 3 variables de Cloudinary, las imágenes se suben a la nube
// (producción / demo). Si no, se guardan en la carpeta local /uploads
// (desarrollo), igual que antes.
export const isCloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

const CLOUDINARY_FOLDER = "anduba-motos";

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Sube un buffer a Cloudinary y devuelve la URL pública (https).
const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url)),
    );
    stream.end(buffer);
  });

// Recibe un archivo de Multer y devuelve el valor que se guarda en la BD:
// - Cloudinary: la URL completa (https://res.cloudinary.com/...)
// - Local: la ruta relativa (/uploads/archivo.jpg); el front arma la URL
//   completa con el pipe `imageUrl`.
const saveImage = async (file) => {
  if (isCloudinaryEnabled) {
    return uploadBufferToCloudinary(file.buffer);
  }
  return `/uploads/${file.filename}`;
};

// Sube un archivo que ya existe en disco (lo usa el script de migración).
const uploadLocalFileToCloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: CLOUDINARY_FOLDER,
    resource_type: "image",
  });
  return result.secure_url;
};

// De "https://res.cloudinary.com/<cloud>/image/upload/v123/anduba-motos/abc.jpg"
// saca el public_id "anduba-motos/abc", que es lo que pide Cloudinary para borrar.
const getCloudinaryPublicId = (url) => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
};

// Borra una imagen sin importar dónde esté guardada. Nunca lanza error:
// si no se puede borrar, solo lo registra en consola.
const deleteImage = async (storedPath) => {
  if (!storedPath) return;

  try {
    if (storedPath.includes("/uploads/")) {
      const filename = storedPath.split("/uploads/")[1];
      await fs.promises.unlink(path.join("uploads", filename));
      return;
    }

    if (isCloudinaryEnabled && storedPath.includes("res.cloudinary.com")) {
      const publicId = getCloudinaryPublicId(storedPath);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("No se pudo borrar la imagen", storedPath, error.message);
  }
};

export { saveImage, deleteImage, uploadLocalFileToCloudinary };
