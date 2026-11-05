import { Router } from "express"

import {getServices, patchServices, createServices, deleteServices, getServicesByid, } from '../controllers/services.controller.js'
import { ROLES } from "../config/global.config.js"
import { authorizationUser } from "../middlewares/authorization.middleware.js"
import authenticationUser from "../middlewares/authentication.middleware.js"
import upload from "../middlewares/multer.middleware.js"


const router  = Router()


const STAFF = [ROLES.OWNER, ROLES.ADMIN]

router.get("/", getServices) 

router.patch("/:idservice", authenticationUser, authorizationUser(STAFF), upload.single("image"), patchServices)
router.post("/", authenticationUser, authorizationUser(STAFF), upload.single("image"), createServices)
router.delete("/:idservice", authenticationUser, authorizationUser(STAFF), deleteServices)
router.get("/:idservice", getServicesByid)


export default router