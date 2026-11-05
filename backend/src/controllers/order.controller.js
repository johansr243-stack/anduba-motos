import mongoose from "mongoose";
import { ROLES } from "../config/global.config.js";
import {
  dbGetOrders,
  dbGetOrdersbyUserID,
  dbCreateOrder,
  dbUpdateOrderWithStock,
  dbDeleteOrderWithStock,
  dbDeleteAllOrdersbyUserID,
  dbGetOrdersbyID,
  dbCreateOrderWithStock,
} from "../services/order.services.js";

const getOrders = async (req, res) => {
  try {
    const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];
    const isStaff = req.payload && STAFF.includes(req.payload.rol);
    const userFilter = isStaff ? undefined : req.payload?._id;

    const data = await dbGetOrders(userFilter);
    res.json({
      msg: "Órdenes obtenidas",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener las órdenes" });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const userID = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ msg: "ID de usuario inválido" });
    }

    const data = await dbGetOrdersbyUserID(userID);

    if (!data) {
      return res
        .status(404)
        .json({ msg: "No se encontraron órdenes para este usuario" });
    }

    res.json({
      msg: "Órdenes del usuario obtenidas",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener las órdenes del usuario" });
  }
};

const getOrderByID = async (req, res) => {
  try {
    const orderID = req.params.orderID;

    if (!mongoose.Types.ObjectId.isValid(orderID)) {
      return res.status(400).json({ msg: "ID de orden inválido" });
    }

    const order = await dbGetOrdersbyID(orderID);

    if (!order) {
      return res.status(404).json({ msg: "La orden no existe" });
    }

    res.json({
      msg: "order",
      order: order,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      msg: "No se pudo obtener la orden",
    });
  }
};
const createOrder = async (req, res) => {
  try {
    const inputData = req.body;

    // Antes esto SIEMPRE pisaba el user con el del token, así que un
    // admin/owner/employee no podía crear una orden a nombre de un
    // cliente real -- el campo "Cliente" del form quedaba inerte.
    // Ahora: si quien hace la petición es staff Y mandó un user, se
    // respeta ese user. Un cliente normal (o si no mandó user) sigue
    // forzado a su propio id, igual que antes.
    const STAFF = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];
    const isStaff = STAFF.includes(req.payload.rol);
    inputData.user = isStaff && inputData.user ? inputData.user : req.payload._id;

    const order = await dbCreateOrderWithStock(inputData);

    res.status(201).json({
      msg: "Orden creada exitosamente",
      data: order,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({
        msg: "No hay stock suficiente para completar la orden",
        product: error.productId,
      });
    }

    res.status(500).json({ msg: "Error al crear la orden" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderID = req.params.orderID;
    const inputData = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderID)) {
      return res.status(400).json({ msg: "ID de orden inválido" });
    }

    const data = await dbUpdateOrderWithStock(orderID, inputData);

    if (!data) {
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    res.json({
      msg: "Orden actualizada",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar la orden" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderID = req.params.orderID;

    if (!mongoose.Types.ObjectId.isValid(orderID)) {
      return res.status(400).json({ msg: "ID de orden inválido" });
    }

    const data = await dbDeleteOrderWithStock(orderID);

    if (!data) {
      return res.status(404).json({ msg: "Orden no encontrada" });
    }

    res.json({
      msg: "Orden eliminada",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar la orden" });
  }
};

const deleteAllOrdersByUserId = async (req, res) => {
  try {
    const userID = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ msg: "ID de usuario inválido" });
    }

    const result = await dbDeleteAllOrdersbyUserID(userID);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        msg: "No se encontraron órdenes para eliminar de este usuario",
      });
    }

    res.json({
      msg: "Todas las órdenes del usuario fueron eliminadas",
      info: `${result.deletedCount} órdenes borradas.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar las órdenes del usuario" });
  }
};

export {
  getOrders,
  getOrdersByUserId,
  createOrder,
  updateOrder,
  deleteOrder,
  deleteAllOrdersByUserId,
  getOrderByID
};
