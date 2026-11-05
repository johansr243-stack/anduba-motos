import AppointmentModel from "../models/appointment.model.js";

const insertAppointment = async (newAppointment) => {
  return await AppointmentModel.create(newAppointment);
};

const dbGetAppointment = async (clientId) => {
  const filter = clientId ? { client: clientId } : {};
  return await AppointmentModel.find(filter).populate([
    { path: "client", select: "username phoneNumber" },
    { path: "motorcycle", select: "licensePlate brand" },
    { path: "registeringUserId", select: "username phoneNumber" },
    { path: "service", select: "name price" },
  ]);
};


const dbGetAppointmentByID = async (appointmentID) => {
  return await AppointmentModel.findById(appointmentID).populate([
    { path: "client", select: "username phoneNumber" },
    { path: "motorcycle", select: "licensePlate brand" },
    { path: "registeringUserId", select: "username phoneNumber" },
    { path: "service", select: "name price" },
  ]);
};


const dbDeleteAppointment = async (appointmentID) => {
  return await AppointmentModel.findOneAndDelete({ _id: appointmentID });
};

const dbUpdateAppointment = async (id, inputData) => {
  return await AppointmentModel.findByIdAndUpdate(id, inputData, {
    returnDocument: "after",
  });
};

export {
  insertAppointment,
  dbUpdateAppointment,
  dbGetAppointment,
  dbDeleteAppointment,
  dbGetAppointmentByID,
};
