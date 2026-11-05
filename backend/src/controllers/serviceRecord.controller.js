import mongoose from "mongoose";
import {
  dbGetServiceRecords,
  dbGetServiceRecordById,
  dbGetServiceRecordsByUserID,
  dbGetServiceRecordsByMechanic,
  dbGetServiceRecordByAppointment,
  dbCreateServiceRecordWithStock,
  dbUpdateServiceRecord,
  dbDeleteServiceRecord,
} from "../services/serviceRecord.service.js";

const getServiceRecords = async (req, res) => {
  try {
    const data = await dbGetServiceRecords();
    res.json({
      msg: "Registros de servicio obtenidos",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener los registros de servicio" });
  }
};

const getServiceRecordById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de registro inválido" });
    }

    const data = await dbGetServiceRecordById(id);

    if (!data) {
      return res.status(404).json({ msg: "Registro de servicio no encontrado" });
    }

    res.json({
      msg: "Registro de servicio obtenido",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener el registro de servicio" });
  }
};

const getServiceRecordsByUserID = async (req, res) => {
  try {
    const userID = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ msg: "ID de usuario inválido" });
    }

    // Llama al servicio que busca las citas del usuario y luego sus registros
    const data = await dbGetServiceRecordsByUserID(userID);

    // Validamos si no se encontró ningún registro para este cliente
    if (data.length === 0) {
      return res.status(404).json({ msg: "El usuario no tiene citas ni registros de servicio creados" });
    }

    res.json({
      msg: "Registros de servicio del usuario obtenidos",
      data: data,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "No hay citas registradas para este usuario") {
      return res.status(404).json({ msg: "No se encontraron citas ni registros para este usuario" });
    }
    res.status(500).json({ msg: "Error al obtener los registros del usuario" });
  }
};

const getServiceRecordsByMechanic = async (req, res) => {
  try {
    const mechanicID = req.params.mechanicID;

    if (!mongoose.Types.ObjectId.isValid(mechanicID)) {
      return res.status(400).json({ msg: "ID de mecánico inválido" });
    }

    const data = await dbGetServiceRecordsByMechanic(mechanicID);

    res.json({
      msg: "Registros de servicio del mecánico obtenidos",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener los registros del mecánico" });
  }
};

const getServiceRecordByAppointment = async (req, res) => {
  try {
    const appointmentID = req.params.appointmentID;

    if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
      return res.status(400).json({ msg: "ID de cita inválido" });
    }

    const data = await dbGetServiceRecordByAppointment(appointmentID);

    if (!data) {
      return res.status(404).json({ msg: "No se encontró registro para esta cita" });
    }

    res.json({
      msg: "Registro de servicio de la cita obtenido",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener el registro por cita" });
  }
};

const createServiceRecord = async (req, res) => {
  try {
    const inputData = req.body;
    inputData.mechanic = req.payload._id; 
    const record = await dbCreateServiceRecordWithStock(inputData);

    res.status(201).json({
      msg: "Registro de servicio creado exitosamente",
      data: record,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({
        msg: "No hay stock suficiente para completar el registro",
        product: error.productId,
      });
    }
    res.status(500).json({ msg: "Error al crear el registro de servicio" });
  }
};

const updateServiceRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const inputData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de registro inválido" });
    }

    const data = await dbUpdateServiceRecord(id, inputData);

    if (!data) {
      return res.status(404).json({ msg: "Registro de servicio no encontrado" });
    }

    res.json({
      msg: "Registro de servicio actualizado",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar el registro de servicio" });
  }
};

const deleteServiceRecord = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID de registro inválido" });
    }

    const data = await dbDeleteServiceRecord(id);

    if (!data) {
      return res.status(404).json({ msg: "Registro de servicio no encontrado" });
    }

    res.json({
      msg: "Registro de servicio eliminado",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar el registro de servicio" });
  }
};

export {
  getServiceRecords,
  getServiceRecordById,
  getServiceRecordsByUserID,
  getServiceRecordsByMechanic,
  getServiceRecordByAppointment,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
};