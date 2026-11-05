import {
  dbGetCartByUser,
  dbAddItemToCart,
  dbUpdateCartItemQuantity,
  dbRemoveCartItem,
  dbClearCart,
  dbGetAllCarts,
  dbCheckoutCart,
} from "../services/shoppingcar.service.js";

const getMyCart = async (req, res) => {
  try {
    const cart = await dbGetCartByUser(req.payload._id);

    if (!cart) {
      return res.json({
        msg: "El carrito esta vacio",
        data: { products: [], price: 0 },
      });
    }

    res.json({
      msg: "Carrito obtenido",
      data: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "No se pudo obtener el carrito" });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    if (!product || !quantity || quantity < 1) {
      return res.status(400).json({
        msg: "Debe indicar product y quantity (mayor a 0)",
      });
    }

    const cart = await dbAddItemToCart(req.payload._id, product, quantity);

    res.status(201).json({
      msg: "Producto agregado al carrito",
      data: cart,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ msg: "El producto no existe" });
    }
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({
        msg: `Solo hay ${error.availableStock} unidades disponibles`,
        product: error.productId,
        availableStock: error.availableStock,
      });
    }

    res.status(500).json({ msg: "No se pudo agregar el producto al carrito" });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ msg: "quantity debe ser mayor a 0" });
    }

    const cart = await dbUpdateCartItemQuantity(
      req.payload._id,
      productId,
      quantity,
    );

    res.json({
      msg: "Cantidad actualizada",
      data: cart,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ msg: "El producto no existe" });
    }
    if (error.code === "CART_NOT_FOUND" || error.code === "ITEM_NOT_FOUND") {
      return res.status(404).json({ msg: "El producto no esta en tu carrito" });
    }
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({
        msg: `Solo hay ${error.availableStock} unidades disponibles`,
        product: error.productId,
        availableStock: error.availableStock,
      });
    }

    res.status(500).json({ msg: "No se pudo actualizar el producto" });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await dbRemoveCartItem(req.payload._id, productId);

    res.json({
      msg: "Producto eliminado del carrito",
      data: cart,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "CART_NOT_FOUND") {
      return res.status(404).json({ msg: "No tienes un carrito activo" });
    }

    res.status(500).json({ msg: "No se pudo eliminar el producto" });
  }
};

const clearCart = async (req, res) => {
  try {
    await dbClearCart(req.payload._id);

    res.json({ msg: "Carrito vaciado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "No se pudo vaciar el carrito" });
  }
};

const getCartByUserId = async (req, res) => {
  try {
    const { userID } = req.params;

    const cart = await dbGetCartByUser(userID);

    if (!cart) {
      return res.json({ msg: "Este usuario no tiene carrito", data: null });
    }

    res.json({
      msg: "Carrito obtenido",
      data: cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "No se pudo obtener el carrito" });
  }
};

const getAllCarts = async (req, res) => {
  try {
    const carts = await dbGetAllCarts();

    res.json({
      msg: "Carritos obtenidos",
      data: carts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "No se pudieron obtener los carritos" });
  }
};

const checkoutCart = async (req, res) => {
  try {
    const { direccionEnvio, metodoPago } = req.body;

    const order = await dbCheckoutCart(req.payload._id, {
      direccionEnvio,
      metodoPago,
    });

    res.status(201).json({
      msg: "Orden creada a partir del carrito",
      data: order,
    });
  } catch (error) {
    console.error(error);

    if (error.code === "EMPTY_CART") {
      return res.status(400).json({ msg: "El carrito esta vacio" });
    }
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({
        msg: "No hay stock suficiente para completar la compra",
        product: error.productId,
      });
    }

    res.status(500).json({ msg: "No se pudo completar la compra" });
  }
};

export {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartByUserId,
  getAllCarts,
  checkoutCart,
};