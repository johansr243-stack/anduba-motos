//service: su responsabilidad es hablarse con la base de datos
import ProductModel from "../models/Product.model.js";
import mongoose from "mongoose";

const registerProduct = async (newProduct) => {
  if (
    Object.prototype.hasOwnProperty.call(newProduct, "stock") &&
    newProduct.stock <= 0 &&
    !Object.prototype.hasOwnProperty.call(newProduct, "status")
  ) {
    newProduct.status = "agotado";
  }
  return await ProductModel.create(newProduct);
};

const dbGetProducts = async () => {
  return await ProductModel.find();
};

const dbGetProductbyId = async (productId) => {
  return await ProductModel.findOne({ _id: productId });
};

const dbDeleteProduct = async (productId) => {
  return await ProductModel.findByIdAndDelete(productId);
};

const dbUpdateProduct = async (productId, updateData) => {
  if (Object.prototype.hasOwnProperty.call(updateData, "stock")) {
    const current = await ProductModel.findById(productId);
    if (!current) return null;

    const statusNoFueModificadoManualmente =
      !Object.prototype.hasOwnProperty.call(updateData, "status") ||
      updateData.status === current.status;

    if (statusNoFueModificadoManualmente) {
      if (updateData.stock <= 0) {
        updateData.status = "agotado";
      } else if (current.status === "agotado") {
        updateData.status = "disponible";
      }
    }
  }

  return await ProductModel.findByIdAndUpdate(productId, updateData, {
    returnDocument: "after",
    runValidators: true,
  });
};

const decrementStockForItems = async (items, session) => {
  for (const item of items) {
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      [
        { $set: { stock: { $subtract: ["$stock", item.quantity] } } },
        { $set: { status: { $cond: [{ $lte: ["$stock", 0] }, "agotado", "$status"] } } },
      ],
      { new: true, session, updatePipeline: true }
    );

    if (!updatedProduct) {
      const error = new Error("Stock insuficiente para completar la operación");
      error.code = "INSUFFICIENT_STOCK";
      error.productId = item.product;
      throw error;
    }

    // Nunca confiar en el precio enviado por el cliente: se sobrescribe
    // con el precio real del producto en la base de datos (precio base + ROI).
    item.unitPrice = updatedProduct.price * (1 + updatedProduct.roi);
    // Se congela también el costo base de ESTE producto en este momento,
    // para que el panel de ganancias sea preciso aunque su price/roi
    // cambie después de vendido.
    item.unitCost = updatedProduct.price;
  }
};


const restoreStockForItems = async (items, session) => {
  for (const item of items) {
    await ProductModel.findByIdAndUpdate(
      item.product,
      [
        { $set: { stock: { $add: ["$stock", item.quantity] } } },
        {
          $set: {
            status: {
              $cond: [
                { $and: [{ $eq: ["$status", "agotado"] }, { $gt: ["$stock", 0] }] },
                "disponible",
                "$status",
              ],
            },
          },
        },
      ],
      { session, updatePipeline: true },
    );
  }
};

export {
  decrementStockForItems,
  restoreStockForItems,
  registerProduct,
  dbGetProducts,
  dbDeleteProduct,
  dbUpdateProduct,
  dbGetProductbyId,
};
