import mongoose from "mongoose";
import AppointmentModel from "../models/appointment.model.js";
import ServiceRecordModel from "../models/ServiceRecord.model.js";
import { dbPushServiceToHistory } from "./history.services.js";
import { decrementStockForItems } from "./product.service.js";


const dbGetServiceRecords = async () => {
  return await ServiceRecordModel.find()
    .populate("mechanic", "username")
    .populate({
      path: "appointment",
      populate: { path: "client", select: "username" },
    })
    .populate("usedProducts.product", "name")
    .sort({ createdAt: -1 });
};

const dbGetServiceRecordsByUserID = async (userID) => {
  
  const userAppointments = await AppointmentModel.find({ client: userID }).select('_id');

  if (userAppointments.length === 0) {
    throw new Error("No hay citas registradas para este usuario");
  }

  const appointmentIDs = userAppointments.map((app) => app._id);

  return await ServiceRecordModel.find({ appointment: { $in: appointmentIDs } })
    .populate({
      
      path: 'appointment',
      populate: { path: 'client', select: 'username phoneNumber' } 
    })
    .populate("mechanic", "username")
    .populate("usedProducts.product", "name");
};

const dbGetServiceRecordById = async (id) => {
  return await ServiceRecordModel.findById(id)
    .populate("mechanic", "username")
    .populate({
      path: "appointment",
      populate: { path: "client", select: "username" },
    })
    .populate("usedProducts.product", "name");
};


const dbGetServiceRecordsByMechanic = async (mechanicID) => {
  return await ServiceRecordModel.find({ mechanic: mechanicID })
    .populate({
      path: "appointment",
      populate: { path: "client", select: "username" },
    })
    .populate("usedProducts.product", "name")
    .sort({ createdAt: -1 });
};


const dbGetServiceRecordByAppointment = async (appointmentID) => {
 
  return await ServiceRecordModel.findOne({ appointment: appointmentID });
};


const dbCreateServiceRecord = async (data) => {
  const record = await ServiceRecordModel.create(data);
  const appointment = await AppointmentModel.findById(record.appointment);
  if (appointment) {
    await dbPushServiceToHistory(appointment.client, record._id);
  }
  return record;
};


const dbUpdateServiceRecord = async (id, updateData) => {
  return await ServiceRecordModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after'});
};


const dbDeleteServiceRecord = async (id) => {
  return await ServiceRecordModel.findByIdAndDelete(id);
};

// Antes esta función tenía un bug que la rompía apenas se llamaba
// (usaba mongoose sin importarlo) y ni siquiera estaba conectada al
// controller -- por eso registrar un servicio con productos usados no
// descontaba stock. Ahora sí descuenta stock (mismo mecanismo que las
// órdenes) y además empuja a history, igual que hacía la versión vieja.
const dbCreateServiceRecordWithStock = async (data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (data.usedProducts?.length) {
      await decrementStockForItems(data.usedProducts, session);
    }

    const [record] = await ServiceRecordModel.create([data], { session });

    await session.commitTransaction();

    const appointment = await AppointmentModel.findById(record.appointment);
    if (appointment) {
      await dbPushServiceToHistory(appointment.client, record._id);
    }

    return record;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export {
  dbGetServiceRecords,
  dbGetServiceRecordById,
  dbGetServiceRecordsByMechanic,
  dbGetServiceRecordByAppointment,
  dbCreateServiceRecordWithStock,
  dbUpdateServiceRecord,
  dbDeleteServiceRecord,
  dbGetServiceRecordsByUserID
};