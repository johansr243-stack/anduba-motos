import { Router } from "express";
import { getSalesSummary } from "../controllers/report.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { authorizationUser } from "../middlewares/authorization.middleware.js";
import { ROLES } from "../config/global.config.js";

const router = Router();

const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];

router.get("/summary", authenticationUser, authorizationUser(STAFF), getSalesSummary);

export default router;
