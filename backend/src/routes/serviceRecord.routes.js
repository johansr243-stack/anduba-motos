import { Router } from "express";
import {
  getServiceRecords,
  getServiceRecordById,
  getServiceRecordsByUserID,
  getServiceRecordsByMechanic,
  getServiceRecordByAppointment,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
} from "../controllers/serviceRecord.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js"
import { authorizationUser } from "../middlewares/authorization.middleware.js"
import { isOwnerOrStaff } from "../middlewares/ownership.middleware.js"
import { ROLES } from "../config/global.config.js"
import AppointmentModel from "../models/appointment.model.js"


const router = Router();


const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE]

router.get("/", authenticationUser, authorizationUser(STAFF), getServiceRecords);
router.post("/", authenticationUser, authorizationUser(STAFF), createServiceRecord);

router.get(
  "/user/:userID",
  authenticationUser,
  isOwnerOrStaff(async (req) => req.params.userID),
  getServiceRecordsByUserID,
);
router.get("/mechanic/:mechanicID", authenticationUser, authorizationUser(STAFF), getServiceRecordsByMechanic);
router.get(
  "/appointment/:appointmentID",
  authenticationUser,
  isOwnerOrStaff(async (req) => {
    const appt = await AppointmentModel.findById(req.params.appointmentID).select("client");
    return appt?.client;
  }),
  getServiceRecordByAppointment,
);

router.get("/:id", authenticationUser, getServiceRecordById);
router.patch("/:id", authenticationUser, authorizationUser(STAFF), updateServiceRecord);
router.delete("/:id", authenticationUser, authorizationUser(STAFF), deleteServiceRecord);               

export default router;