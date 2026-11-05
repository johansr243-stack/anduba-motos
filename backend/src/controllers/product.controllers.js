import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import {
  dbDeleteProduct,
  dbGetProductbyId,
  dbGetProducts,
  dbUpdateProduct,
  registerProduct,
} from "../services/product.service.js";

// const getProducts = async (req, res) => {
//   try {
//     const products = await dbGetProducts();

//     if (!products || products.length === 0) {
//       return res.status(400).json({
//         msg: "No hay productos registrados",
//       });
//     }
//     const serverUrl = `${req.protocol}://${req.get("host")}`;
//     // Armamos la URL completa AL VUELO sin afectar la base de datos
//     const fixedProducts = products.map((prod) => {
//       // Necesitamos convertir el documento de mongoose a objeto de JS normal
//       const p = prod.toObject ? prod.toObject() : prod;

//       if (p.productImages && p.productImages.length > 0) {
//         p.productImages = p.productImages.map((img) => {
//           // ESTO ARREGLA TUS PRODUCTOS VIEJOS: si guardaste localhost, se lo quitamos y le ponemos la IP correcta
//           if (img.includes("localhost")) {
//             const filename = img.split("/uploads/")[1];
//             return `${serverUrl}/uploads/${filename}`;
//           }
//           // Y esto es para los nuevos que ya se guardan bien
//           if (img.startsWith("http")) return img;
//           const path = img.startsWith("/") ? img : `/${img}`;
//           return `${serverUrl}${path}`;
//         });
//       }
//       return p;
//     });

//     res.json({
//       msg: "Lista de productos",
//       data: fixedProducts,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       msg: "No se pudo obtener los productos",
//     });
//   }
// };
const getProducts = async (req, res) => {
  try {
    const products = await dbGetProducts();

    if (!products || products.length === 0) {
      return res.status(400).json({
        msg: "No hay productos registrados",
      });
    }

    res.json({
      msg: "Lista de productos",
      data: products,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "No se pudo obtener los productos",
    });
  }
};

const pacthProducts = async (req, res) => {
  try {
    const productId = req.params.productId;

    const updateData = req.body;

    const touchedImages =
      updateData.existingImages !== undefined || (req.files?.length ?? 0) > 0;

    if (touchedImages) {
      let keptImages = [];
      try {
        keptImages = updateData.existingImages
          ? JSON.parse(updateData.existingImages)
          : [];
        keptImages = keptImages.map((img) => {
          if (img.includes("/uploads/")) {
            const filename = img.split("/uploads/")[1];
            return `/uploads/${filename}`;
          }
          return img;
        });
      } catch {
        keptImages = [];
      }
      delete updateData.existingImages;

      const newImages = (req.files || []).map(
        (file) => `/uploads/${file.filename}`, // MANTENLO ASÍ DE CORTO
      );

      const finalImages = [...keptImages, ...newImages];

      if (finalImages.length > 6) {
        return res.status(400).json({
          msg: "Un producto no puede tener más de 6 imágenes",
        });
      }

      // Borra del disco las imágenes que el producto tenía y que ya
      // no están en la lista final (las que el usuario eliminó en el form)
      const currentProduct = await dbGetProductbyId(productId);
      if (currentProduct) {
        const removedImages = currentProduct.productImages.filter(
          (url) => !finalImages.includes(url),
        );

        removedImages.forEach((url) => {
          const filename = url.split("/uploads/")[1];
          if (filename) {
            fs.unlink(path.join("uploads", filename), (err) => {
              if (err) console.error("No se pudo borrar", filename, err);
            });
          }
        });
      }

      updateData.productImages = finalImages;
    }

    const updatedProduct = await dbUpdateProduct(productId, updateData);

    if (!updatedProduct) {
      throw new Error("El producto solicitado no existe");
    }

    res.json({
      msg: "Producto actualizado",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    console.log(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "Ingrese un Id valido",
      });
    }

    if (error.message.includes("El producto solicitado no existe")) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    res.status(500).json({
      msg: "No se pudo actualizar el producto",
    });
  }
};

// const getProductById = async (req, res) => {

//   try {
//     const productId = req.params.productId;

//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({
//         msg: "Ingrese un Id valido",
//       });
//     }

//     const product = await dbGetProductbyId(productId);

//     if (!product) {
//       return res.status(404).json({
//         msg: "El producto no existe",
//       });
//     }
//     const serverUrl = `${req.protocol}://${req.get("host")}`;

//     // Convertimos el documento de Mongo a un objeto JavaScript normal
//     const p = product.toObject ? product.toObject() : product;
//     if (p.productImages && p.productImages.length > 0) {
//       p.productImages = p.productImages.map((img) => {
//         // Si tiene localhost quemado (de tus pruebas anteriores), lo arreglamos
//         if (img.includes("localhost")) {
//           const filename = img.split("/uploads/")[1];
//           return `${serverUrl}/uploads/${filename}`;
//         }
//         // Si ya es un link completo válido, no lo tocamos
//         if (img.startsWith("http")) return img;

//         // Si es una ruta relativa (como se deben guardar ahora), le pegamos el servidor
//         const path = img.startsWith("/") ? img : `/${img}`;
//         return `${serverUrl}${path}`;
//       });
//     }

//     res.json({
//       msg: "Producto",
//       product: p,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       msg: "No se pudo traer el producto",
//     });
//   }
// };

const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        msg: "Ingrese un Id valido",
      });
    }

    const product = await dbGetProductbyId(productId);

    if (!product) {
      return res.status(404).json({
        msg: "El producto no existe",
      });
    }

    res.json({
      msg: "Producto",
      product: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo traer el producto",
    });
  }
};
const createProduct = async (req, res) => {
  try {
    const inputData = req.body;

    inputData.createdBy = req.payload._id;

    if (req.files && req.files.length > 0) {
      inputData.productImages = req.files.map(
        (file) => `/uploads/${file.filename}`, // MANTENLO ASÍ DE CORTO
      );
    }

    // obtiene los datos enviados en la peticion

    if (!inputData) {
      return res.status(400).json({
        msg: "Tiene que ingresar datos para crear el producto",
      });
    }

    const data = await registerProduct(inputData);

    await data.populate("createdBy", "username _id email"); // registra usando el modelo y guarda la respuesta en la constante data

    res.status(201).json({
      // respondemos al clientre enviando los datos registrados y el codigo  de estado cuando se crea un recurso nuevo con exito
      msg: "Producto creado",
      inputData: data,
    });
  } catch (error) {
    console.error(error); //respuesta para el desarrollador

    if (error.code === 11000) {
      const repeatedValue = Object.entries(error.keyValue);

      return res.status(400).json({
        msg: "Ingrese un objeto sin propiedades repetidas",
        repeated: repeatedValue,
      });
    }

    res.status(500).json({
      msg: "no se pudo registrar el producto", // respuesta para el cliente
    });
  }
};

const deleteProducts = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        msg: "Ingrese un Id valido",
      });
    }

    const deletedProduct = await dbDeleteProduct(productId);

    if (!deletedProduct) {
      return res.status(404).json({
        msg: "El producto que intenta eliminar no existe",
      });
    }

    res.json({
      msg: "Producto eliminado",
      deletedProduct: deletedProduct,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "No se pudo eliminar el producto",
    });
  }
};

export {
  getProducts,
  pacthProducts,
  createProduct,
  deleteProducts,
  getProductById,
};
