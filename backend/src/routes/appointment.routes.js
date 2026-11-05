import { Router } from "express";

import {
  createAppointment,
  deletAppointment,
  getAppointment,
  getAppointmentByID,
  updateAppointmentID,
} from "../controllers/appointment.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { validateMotorcycleBelongsToClient } from "../middlewares/relationMatch.middleware.js"
import { isOwnerOrStaff } from "../middlewares/ownership.middleware.js"
import AppointmentModel from "../models/appointment.model.js"

const router = Router();


router.get("/", authenticationUser, getAppointment);
router.get("/:id", authenticationUser, getAppointmentByID);
router.post(
  "/",
  authenticationUser,
  validateMotorcycleBelongsToClient,
  createAppointment,
);

router.patch(
  "/:id",
  authenticationUser,
  isOwnerOrStaff(async (req) => {
    const appt = await AppointmentModel.findById(req.params.id).select(
      "client",
    );
    return appt?.client;
  }),
  updateAppointmentID,
);

router.delete(
  "/:id",
  authenticationUser,
  isOwnerOrStaff(async (req) => {
    const appt = await AppointmentModel.findById(req.params.id).select(
      "client",
    );
    return appt?.client;
  }),
  deletAppointment,
);

export default router;
