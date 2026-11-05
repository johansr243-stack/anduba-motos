import { Router } from "express";

import {
  getMyCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartByUserId,
  getAllCarts,
  checkoutCart,
} from "../controllers/shoppingcar.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { authorizationUser } from "../middlewares/authorization.middleware.js";
import { ROLES } from "../config/global.config.js";

const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];

const router = Router();

// Carrito del usuario autenticado (no requiere id: solo existe un carrito por persona)
router.get("/", authenticationUser, getMyCart);
router.delete("/", authenticationUser, clearCart);

// Items del carrito
router.post("/items", authenticationUser, addItemToCart);
router.patch("/items/:productId", authenticationUser, updateCartItem);
router.delete("/items/:productId", authenticationUser, removeCartItem);

// Punto 6: convierte el carrito en una orden y lo borra (todo o nada)
router.post("/checkout", authenticationUser, checkoutCart);

// Solo staff: ver todos los carritos existentes
router.get("/all", authenticationUser, authorizationUser(STAFF), getAllCarts);

// Solo staff: ver el carrito de un usuario puntual (soporte/administración)
router.get(
  "/user/:userID",
  authenticationUser,
  authorizationUser(STAFF),
  getCartByUserId,
);

export default router;