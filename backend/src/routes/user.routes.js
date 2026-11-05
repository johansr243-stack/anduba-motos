import { Router } from "express";

import {
  getUsers,
  patchUsers,
  createUsers,
  deleteUsers,
  getUsersbyId,
  searchUsers,
} from "../controllers/user.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { authorizationUser } from "../middlewares/authorization.middleware.js";
import { ROLES } from "../config/global.config.js";
import { preventOwnerDeletion, preventRoleEscalation, preventSelfDelete } from "../middlewares/userProtection.middleware.js";

const router = Router();

router.get("/",authenticationUser,authorizationUser([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.OWNER]),getUsers);
// IMPORTANTE: tiene que ir antes que "/:userID" o Express interpreta "search" como un id
router.get("/search",authenticationUser,authorizationUser([ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.OWNER]),searchUsers);
router.patch("/:userID", authenticationUser, preventRoleEscalation, patchUsers);
router.get("/:userID", authenticationUser, getUsersbyId);
router.delete("/:userID",authenticationUser,preventSelfDelete,preventOwnerDeletion ,deleteUsers
);
router.post("/",authenticationUser,authorizationUser([ROLES.ADMIN,ROLES.OWNER]), createUsers);

export default router;
