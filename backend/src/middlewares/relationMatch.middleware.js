import MotorcycleModel from "../models/Motorcycle.model.js";

const validateMotorcycleBelongsToClient = async (req, res, next) => {
  try {
    const { motorcycle, client } = req.body;

    if (!motorcycle || !client) {
      return res.status(400).json({
        msg: "Debe indicar la motocicleta y el cliente de la cita",
      });
    }

    const motorcycleDoc = await MotorcycleModel.findById(motorcycle).select("client");

    if (!motorcycleDoc) {
      return res.status(404).json({ msg: "La motocicleta no existe" });
    }

    if (motorcycleDoc.client.toString() !== client.toString()) {
      return res.status(400).json({
        msg: "La motocicleta indicada no pertenece al cliente indicado",
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "No se pudo validar la motocicleta" });
  }
};

export { validateMotorcycleBelongsToClient };