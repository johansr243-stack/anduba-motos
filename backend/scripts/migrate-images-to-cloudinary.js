// Sube a Cloudinary las imágenes que están en la carpeta local /uploads y
// actualiza las rutas guardadas en la base de datos (productos y servicios).
//
// Uso (desde la carpeta backend, con el .env apuntando a la base de la demo
// y con las variables de Cloudinary configuradas):
//   npm run migrate:images
//
// Se puede correr varias veces sin problema: solo procesa las rutas que
// todavía empiezan por /uploads/.

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {
  isCloudinaryEnabled,
  uploadLocalFileToCloudinary,
} from "../src/helpers/storage.helper.js";

if (!isCloudinaryEnabled) {
  console.error(
    "Faltan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET en el .env",
  );
  process.exit(1);
}

if (!process.env.DB_URI) {
  console.error("Falta DB_URI en el .env");
  process.exit(1);
}

// Cache para no subir dos veces el mismo archivo si se repite en la BD
const uploadedCache = new Map();
const stats = { uploaded: 0, missing: 0 };

const migratePath = async (storedPath) => {
  if (!storedPath || !storedPath.includes("/uploads/")) return storedPath;

  const filename = storedPath.split("/uploads/")[1];
  if (uploadedCache.has(filename)) return uploadedCache.get(filename);

  const localFile = path.join("uploads", filename);
  if (!fs.existsSync(localFile)) {
    console.warn(`  ⚠ No existe ${localFile}, se deja la ruta como está`);
    stats.missing++;
    return storedPath;
  }

  const url = await uploadLocalFileToCloudinary(localFile);
  uploadedCache.set(filename, url);
  stats.uploaded++;
  console.log(`  ↑ ${filename}`);
  return url;
};

const main = async () => {
  await mongoose.connect(process.env.DB_URI);
  const db = mongoose.connection.db;
  console.log(`Base de datos: ${db.databaseName}\n`);

  // Productos: arreglo productImages
  console.log("Productos:");
  const products = db.collection("products");
  for await (const product of products.find({ productImages: { $regex: "/uploads/" } })) {
    const newImages = [];
    for (const img of product.productImages) {
      newImages.push(await migratePath(img));
    }
    await products.updateOne({ _id: product._id }, { $set: { productImages: newImages } });
  }

  // Servicios: campo serviceImage
  console.log("\nServicios:");
  const services = db.collection("services");
  for await (const service of services.find({ serviceImage: { $regex: "/uploads/" } })) {
    const newImage = await migratePath(service.serviceImage);
    await services.updateOne({ _id: service._id }, { $set: { serviceImage: newImage } });
  }

  await mongoose.disconnect();
  console.log(
    `\nListo: ${stats.uploaded} imágenes subidas, ${stats.missing} no encontradas en /uploads.`,
  );
};

main().catch((error) => {
  console.error("Error en la migración:", error.message);
  process.exit(1);
});
