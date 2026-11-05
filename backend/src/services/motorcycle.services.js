import MotorcycleModel from "../models/Motorcycle.model.js";

const registerMotorcycle = async (newMotorcycle) => {
  return await MotorcycleModel.create(newMotorcycle);
};

const dbGetMotorcycleById = async (motorcycleId) => {
  // Se popula el cliente (igual que en dbGetMotorcycles) para que el
  // formulario de edición pueda mostrar el nombre del dueño, no solo su id
  return await MotorcycleModel.findOne({ _id: motorcycleId }).populate({
    path: "client",
    select: "username",
  });
};
const dbGetMotorcycles = async () => {
  return await MotorcycleModel.find().populate({path:'client', select:'username'})
};

const dbDeleteMotorcycle = async (motorcycleId) => {
  return await MotorcycleModel.findByIdAndDelete(motorcycleId);
};

const dbUpdateMotorcycle = async (motorcycleId, updateData) => {
  return await MotorcycleModel.findByIdAndUpdate(motorcycleId, updateData, {
    returnDocument: "after",
  });
};

const dbGetMotorcycleByUserId = async (userId)=>{

  return await MotorcycleModel.find({client:userId})

}

export {
  registerMotorcycle,
  dbGetMotorcycles,
  dbDeleteMotorcycle,
  dbUpdateMotorcycle,
  dbGetMotorcycleById,
  dbGetMotorcycleByUserId,
};
