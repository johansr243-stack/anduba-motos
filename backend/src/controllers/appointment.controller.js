// Controller se encarga de manejar las peticiones y las respuestas de los clientes

import mongoose from "mongoose";
import AppointmentModel from "../models/appointment.model.js";
import { ROLES } from "../config/global.config.js";
import {
  dbGetAppointment,
  insertAppointment,
  dbDeleteAppointment,
  dbGetAppointmentByID,
  dbUpdateAppointment,
} from "../services/appointment.services.js";

const createAppointment = async (req, res) => {
  try {
    const inputData = req.body;
    const { rol, _id } = req.payload;

    if (rol === ROLES.CLIENT) {
      inputData.client = _id; 
    }

    inputData.registeringUserId = _id;

    const data = await insertAppointment(inputData);
    res.json({ msg: "Cita creada exitosamente", data: data });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        msg: messages,
      });
    }

    if (error.code === 11000) {
      return res.json({
        msg: "Error de validación por cliente duplicado",
      });
    }

    res.status(500).json({
      msg: "Error: No se pudo crear la cita",
    });
  }
};

const getAppointment = async (req, res) => {
  try {
    const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];
    const isStaff = req.payload && STAFF.includes(req.payload.rol);
    const clientFilter = isStaff ? undefined : req.payload?._id;

    const data = await dbGetAppointment(clientFilter);

    res.json({
      msg: "Obtener todas las citas",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error no se pudo obtener la cita",
    });
  }
};

const getAppointmentByID = async (req, res) => {
  try {
    const id = req.params.id;

    // Defensiva: condicionamos previo a que ocurra el error

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "No se encontro el ID",
      });
    }

    const data = await dbGetAppointmentByID(id);
    res.json({
      msg: "Se obtuvo la cita por ID",
      data: data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: "No se pudo obtener la cita por ID",
    });
  }
};

const updateAppointmentID = async (req, res) => {
  try {
    const id = req.params.id; //id de lo que quiero actualizar
    const inputData = req.body; // obtiene los paramteros que quiero actualizar

    if (!inputData) {
      throw new Error("Ingrese datos para actualizar");
    }

    const updatedAppoinment = await dbUpdateAppointment(id, inputData);

    res.json({
      msg: "Se actualizo la cita",
      data: updatedAppoinment,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "No se encontro el ID",
      });
    }

    if (
      error.message.includes("No se puede actualizar un producto inexistente")
    ) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    res.status(500).json({
      msg: "No se pudo actualizar la cita",
    });
  }
};

const deletAppointment = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "No se encontro el ID",
      });
    }

    const data = await dbDeleteAppointment(id);

    if (!data) {
      return res.json({
        msg: "No se puede eliminar un producto inexistente",
      });
    }

    res.json({
      msg: "Se elimino la cita",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error: No se pudo eliminar la cita",
    });
  }
};

export {
  createAppointment,
  getAppointment,
  updateAppointmentID,
  deletAppointment,
  getAppointmentByID,
};
