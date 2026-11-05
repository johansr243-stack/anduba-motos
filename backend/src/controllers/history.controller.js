import mongoose from "mongoose";
import { dbgetHistorybyId, dbGetHistories,dbDeleteHistory,dbCreateHistory, dbUpdateHistory} from "../services/history.services.js";
import { ROLES } from "../config/global.config.js";

const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];

const getHistorybyUserId = async (req, res) => {
  try {
    const userID = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ msg: "ID de usuario inválido" });
    }

    const history = await dbgetHistorybyId(userID);

    if (!history) {
      return res.status(404).json({ msg: "No se encontró el historial" });
    }

    res.json({
      msg: 'Historial',
      history: history,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Error al obtener el historial",
    });
  }
};

const getHistories = async (req, res) => {
  try {
    const data = await dbGetHistories();
    res.json({
      msg: "Historiales obtenidos",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener los historiales" });
  }
};
const createHistory = async (req, res) => {
  try {
    const inputData = req.body;

    // Un cliente solo puede crear el historial de si mismo; solo el staff
    // puede indicar explicitamente un "user" distinto en el body.
    if (!STAFF.includes(req.payload?.rol)) {
      inputData.user = req.payload._id;
    }

    const history = await dbCreateHistory(inputData);

    res.status(201).json({
      msg: "Historial creado exitosamente",
      data: history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear el historial" });
  }
};
const updateHistory = async (req, res) => {
  try {
    const id = req.params.userID;
    const inputData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    const data = await dbUpdateHistory(id, inputData);

    if (!data) {
      return res.status(404).json({ msg: "Historial no encontrado" });
    }

    res.json({
      msg: "Historial actualizado",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar el historial" });
  }
};

const deleteHistory = async (req, res) => {
  try {
    const id = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID inválido" });
    }

    const data = await dbDeleteHistory(id);

    if (!data) {
      return res.status(404).json({ msg: "Historial no encontrado" });
    }

    res.json({
      msg: "Historial eliminado",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar el historial" });
  }
};

export {
  getHistorybyUserId,
  getHistories,
  createHistory,
  updateHistory,
  deleteHistory,
};
