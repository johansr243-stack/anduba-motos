import mongoose from "mongoose";
import shoppingcarmodel from "../models/shoppingcar.models.js";
import OrderModel from "../models/Order.model.js";
import { dbGetProductbyId, decrementStockForItems } from "./product.service.js";
import { dbPushOrderToHistory } from "./history.services.js";

const CART_POPULATE_FIELDS = "name price productImages stock status";

const recalculateTotal = (products) =>
  products.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

const dbGetCartByUser = async (userId) => {
  return await shoppingcarmodel
    .findOne({ user: userId })
    .populate("products.product", CART_POPULATE_FIELDS);
};

const dbAddItemToCart = async (userId, productId, quantity) => {
  const product = await dbGetProductbyId(productId);

  if (!product) {
    const error = new Error("El producto no existe");
    error.code = "PRODUCT_NOT_FOUND";
    throw error;
  }

  let cart = await shoppingcarmodel.findOne({ user: userId });

  const existingItem = cart?.products?.find(
    (item) => item.product.toString() === productId,
  );

  const desiredQuantity = (existingItem?.quantity || 0) + quantity;

  if (product.stock < desiredQuantity) {
    const error = new Error("Stock insuficiente");
    error.code = "INSUFFICIENT_STOCK";
    error.productId = productId;
    error.availableStock = product.stock;
    throw error;
  }

  if (!cart) {
    cart = await shoppingcarmodel.create({
      user: userId,
      products: [{ product: productId, quantity, unitPrice: product.price * (1 + product.roi) }],
      price: product.price * (1 + product.roi) * quantity,
    });
  } else {
    if (existingItem) {
      existingItem.quantity = desiredQuantity;
      existingItem.unitPrice = product.price * (1 + product.roi); // siempre se refresca al precio actual con ROI
    } else {
      cart.products.push({
        product: productId,
        quantity,
        unitPrice: product.price * (1 + product.roi),
      });
    }
    cart.price = recalculateTotal(cart.products);
    await cart.save();
  }

  return await dbGetCartByUser(userId);
};

const dbUpdateCartItemQuantity = async (userId, productId, quantity) => {
  const product = await dbGetProductbyId(productId);

  if (!product) {
    const error = new Error("El producto no existe");
    error.code = "PRODUCT_NOT_FOUND";
    throw error;
  }

  if (product.stock < quantity) {
    const error = new Error("Stock insuficiente");
    error.code = "INSUFFICIENT_STOCK";
    error.productId = productId;
    error.availableStock = product.stock;
    throw error;
  }

  const cart = await shoppingcarmodel.findOne({ user: userId });

  if (!cart) {
    const error = new Error("El carrito no existe");
    error.code = "CART_NOT_FOUND";
    throw error;
  }

  const item = cart.products.find(
    (p) => p.product.toString() === productId,
  );

  if (!item) {
    const error = new Error("El producto no esta en el carrito");
    error.code = "ITEM_NOT_FOUND";
    throw error;
  }

  item.quantity = quantity;
  item.unitPrice = product.price * (1 + product.roi);
  cart.price = recalculateTotal(cart.products);
  await cart.save();

  return await dbGetCartByUser(userId);
};

const dbRemoveCartItem = async (userId, productId) => {
  const cart = await shoppingcarmodel.findOne({ user: userId });

  if (!cart) {
    const error = new Error("El carrito no existe");
    error.code = "CART_NOT_FOUND";
    throw error;
  }

  cart.products = cart.products.filter(
    (p) => p.product.toString() !== productId,
  );
  cart.price = recalculateTotal(cart.products);
  await cart.save();

  return await dbGetCartByUser(userId);
};

const dbClearCart = async (userId) => {
  return await shoppingcarmodel.findOneAndDelete({ user: userId });
};

const dbGetAllCarts = async () => {
  return await shoppingcarmodel
    .find()
    .populate("user", "username email")
    .populate("products.product", CART_POPULATE_FIELDS);
};

// Punto 6: convierte el carrito del usuario en una orden y lo elimina,
// todo dentro de la misma transacción (si algo falla, el carrito queda intacto).
const dbCheckoutCart = async (userId, extraData = {}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await shoppingcarmodel.findOne({ user: userId }).session(session);

    if (!cart || cart.products.length === 0) {
      const error = new Error("El carrito esta vacio");
      error.code = "EMPTY_CART";
      throw error;
    }

    // Solo viaja product + quantity a la orden: el precio real lo vuelve
    // a poner decrementStockForItems, nunca el unitPrice guardado en el carrito.
    const orderProducts = cart.products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));

    await decrementStockForItems(orderProducts, session);

    const total = orderProducts.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const [order] = await OrderModel.create(
      [
        {
          user: userId,
          products: orderProducts,
          total,
          direccionEnvio: extraData.direccionEnvio,
          metodoPago: extraData.metodoPago,
        },
      ],
      { session },
    );
    await dbPushOrderToHistory(userId, order._id, session);

    await shoppingcarmodel.findOneAndDelete({ user: userId }, { session });

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export {
  dbGetCartByUser,
  dbAddItemToCart,
  dbUpdateCartItemQuantity,
  dbRemoveCartItem,
  dbClearCart,
  dbGetAllCarts,
  dbCheckoutCart,
};