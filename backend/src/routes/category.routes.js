import { Router } from "express"

import {getCategory, patchCategory, createCategory, deleteCategory, getCategoryByid, } from '../controllers/category.controller.js'
import authenticationUser from "../middlewares/authentication.middleware.js";
import { authorizationUser } from "../middlewares/authorization.middleware.js";
import { ROLES } from "../config/global.config.js";

const router  = Router()


//Definicion rutas

router.get("/", getCategory)

router.post("/", authenticationUser, authorizationUser([ROLES.OWNER, ROLES.ADMIN]), createCategory)

router.delete("/:id", authenticationUser, authorizationUser([ROLES.OWNER, ROLES.ADMIN]), deleteCategory)

router.patch("/:id", authenticationUser, authorizationUser([ROLES.OWNER, ROLES.ADMIN]), patchCategory)

router.get("/:id", authenticationUser, getCategoryByid)


export default router