import { Router } from "express";

const router = Router();

import {
  createProduct,
  deleteProducts,
  getProductById,
  getProducts,
  pacthProducts,
} from "../controllers/product.controllers.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { ROLES } from "../config/global.config.js";
import { authorizationUser } from "../middlewares/authorization.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE]

// definir rutas para productos
router.get("/", getProducts);
router.get('/:productId', getProductById)
router.patch("/:productId", authenticationUser, authorizationUser(STAFF), upload.array("images", 6), pacthProducts);
router.post("/", authenticationUser, authorizationUser(STAFF), upload.array("images", 6), createProduct);
router.delete("/:productId", authenticationUser, authorizationUser(STAFF), deleteProducts);

export default router;
