import HistoryModel from "../models/History.model.js";

const dbgetHistorybyId = async (userID) => {
  return await HistoryModel.findOne({ user: userID })
    .populate({ path: "user", select: "username firstName lastName" })
    .populate({
      path: "products",
      select: "total status createdAt products",
      populate: {
        path: "products.product",
        select: "name productImages",
      },
    })
    .populate({
      path: "services",
      select: "finalCost description createdAt appointment",
      populate: {
        path: "appointment",
        select: "motorcycle service",
        populate: [
          { path: "motorcycle", select: "brand licensePlate" },
          { path: "service", select: "name" },
        ],
      },
    });
};

const dbGetHistories = async () => {
  return await HistoryModel.find()
    .populate({ path: "user", select: "username" })
    .populate({ path: "products", select: "total" })
    .populate({ path: "services", select: "finalCost" });
};

const dbUpdateHistory = async (id, updateData) => {
 
  const update = {};

  if (Array.isArray(updateData.products) && updateData.products.length > 0) {
    update.$addToSet = {
      ...(update.$addToSet || {}),
      products: { $each: updateData.products },
    };
  }

  if (Array.isArray(updateData.services) && updateData.services.length > 0) {
    update.$addToSet = {
      ...(update.$addToSet || {}),
      services: { $each: updateData.services },
    };
  }

  if (Object.keys(update).length === 0) {
    // No mandaron products/services (o mandaron arrays vacios): no hay nada
    // que acumular, simplemente devolvemos el historial actual.
    return await HistoryModel.findOne({ user: id });
  }

  return await HistoryModel.findOneAndUpdate({ user: id }, update, {
    returnDocument: "after",
    upsert: true,
  });
};

const dbDeleteHistory = async (userID) => {
  return await HistoryModel.findOneAndDelete({ user: userID });
};

const dbPushOrderToHistory = async (userId, orderId, session) => {
  return await dbUpdateHistory(userId, { products: [orderId] }, session);
};

const dbPushServiceToHistory = async (userId, serviceRecordId, session) => {
  return await dbUpdateHistory(userId, { services: [serviceRecordId] }, session);
};

const dbCreateHistory = async (history) => {
  return await HistoryModel.create(history);
};

export {
  dbgetHistorybyId,
  dbCreateHistory,
  dbDeleteHistory,
  dbUpdateHistory,
  dbGetHistories,
  dbPushOrderToHistory,
  dbPushServiceToHistory
};