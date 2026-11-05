import OrderModel from "../models/Order.model.js";
import mongoose from "mongoose";
import {
  decrementStockForItems,
  restoreStockForItems,
} from "./product.service.js";
import { dbPushOrderToHistory } from "./history.services.js";

const dbGetOrders = async (userId) => {
  const filter = userId ? { user: userId } : {};
  return await OrderModel.find(filter)
    .populate("user", "username email")
    .populate("products.product", "name")
    .sort({ createdAt: -1 });
};

const dbGetOrdersbyUserID = async (userID) => {
  return await OrderModel.find({ user: userID })
    .populate("user", "username email")
    .populate("products.product", "name")
    .sort({ createdAt: -1 });
};

const dbGetOrdersbyID = async (orderID) => {
  return await OrderModel.findById(orderID)
    .populate("user", "username email")
    .populate("products.product", "name");
};

const dbDeleteOrder = async (orderID) => {
  return await OrderModel.findByIdAndDelete(orderID);
};

const dbUpdateOrders = async (orderID, updateData) => {
  return await OrderModel.findByIdAndUpdate(orderID, updateData, { new: true });
};

const dbUpdateOrderWithStock = async (orderID, updateData) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingOrder = await OrderModel.findById(orderID).session(session);
    if (!existingOrder) {
      await session.abortTransaction();
      return null;
    }

    const isCancelling =
      updateData.status === "canceled" && existingOrder.status !== "canceled";

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderID,
      updateData,
      {
        new: true,
        session,
      },
    );

    if (isCancelling) {
      await restoreStockForItems(updatedOrder.products, session);
    }

    await session.commitTransaction();
    return updatedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const dbDeleteOrderWithStock = async (orderID) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const existingOrder = await OrderModel.findById(orderID).session(session);
    if (!existingOrder) {
      await session.abortTransaction();
      return null;
    }

    if (existingOrder.status !== "canceled") {
      await restoreStockForItems(existingOrder.products, session);
    }

    const deletedOrder = await OrderModel.findByIdAndDelete(orderID, {
      session,
    });

    await session.commitTransaction();
    return deletedOrder;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const dbCreateOrder = async (data) => {
  return await OrderModel.create(data);
};

const dbDeleteAllOrdersbyUserID = async (userID) => {
  return await OrderModel.deleteMany({ user: userID });
};
const dbCreateOrderWithStock = async (newOrder) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await decrementStockForItems(newOrder.products, session);

    newOrder.total = newOrder.products.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const [order] = await OrderModel.create([newOrder], { session });
    await dbPushOrderToHistory(newOrder.user, order._id, session);

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export {
  dbGetOrders,
  dbCreateOrder,
  dbGetOrdersbyUserID,
  dbDeleteAllOrdersbyUserID,
  dbDeleteOrder,
  dbUpdateOrders,
  dbUpdateOrderWithStock,
  dbDeleteOrderWithStock,
  dbGetOrdersbyID,
  dbCreateOrderWithStock,
};
