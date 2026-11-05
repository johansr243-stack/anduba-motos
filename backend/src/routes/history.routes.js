import { Router } from "express";
import {
  createHistory,
  deleteHistory,
  getHistories,
  getHistorybyUserId,
  updateHistory,
} from "../controllers/history.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { ROLES } from "../config/global.config.js";
import { isOwnerOrStaff } from "../middlewares/ownership.middleware.js"
import { authorizationUser } from "../middlewares/authorization.middleware.js";



const router = Router();

const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];

router.get("/", authenticationUser, authorizationUser(STAFF), getHistories);

router.get(
  "/:userID",
  authenticationUser,
  isOwnerOrStaff(async (req) => req.params.userID),
  getHistorybyUserId
);

router.post("/", authenticationUser ,createHistory);

router.patch(
  "/:userID",
  authenticationUser,
  isOwnerOrStaff(async (req) => req.params.userID),
  updateHistory
);

router.delete(
  "/:userID",
  authenticationUser,
  authorizationUser([ROLES.OWNER, ROLES.ADMIN]), 
  deleteHistory
);


export default router;
