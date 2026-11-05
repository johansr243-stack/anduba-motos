import mongoose from "mongoose";
import {
  dbDeleteMotorcycle,
  dbGetMotorcycleById,
  dbGetMotorcycleByUserId,
  dbGetMotorcycles,
  dbUpdateMotorcycle,
  registerMotorcycle,
} from "../services/motorcycle.services.js";

async function getMc(req, res) {
  try {
    const data = await dbGetMotorcycles();

    if (!data || data.length === 0) {
      return res.status(400).json({
        msg: "No hay motos registradas",
      });
    }

    res.json({
      msg: "lista motocicletas",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "no se pudieron obtener las motocicletas",
    });
  }
}
async function getMcById(req, res) {
  try {
    const motorcycleId = req.params.motorcycleId;

    if (!mongoose.Types.ObjectId.isValid(motorcycleId)) {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    const motorcycle = await dbGetMotorcycleById(motorcycleId);

    if (!motorcycle) {
      return res.status(400).json({
        msg: "La moto no se encuentra registrada",
      });
    }

    res.json({
      msg: "Motocicleta",
      motorcycle: motorcycle,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo traer la motocicleta",
    });
  }
}
async function patchMc(req, res) {
  try {
    const motorcycleId = req.params.motorcycleId;

    const updateData = req.body;

    const updatedMotorcycle = await dbUpdateMotorcycle(
      motorcycleId,
      updateData,
    );

    if (!updatedMotorcycle) {
      throw new Error("La motocicleta no se encuentra registrada");
    }

    res.json({
      msg: "Moto actualizada",
      updatedMotorcycle: updatedMotorcycle,
    });
  } catch (error) {
    console.log(error);

    //VALIDACION DE EXEPCION

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    if (error.message.includes("La motocicleta no se encuentra registrada"))
      return res.status(404).json({
        msg: error.message,
      });

    res.status(500).json({
      msg: "No se pudo actualizar la motocicleta",
    });
  }
}
async function createMc(req, res) {
  try {
    const inputData = req.body;

    inputData.registeringUserId = req.payload._id;

    const data = await registerMotorcycle(inputData);

    res.status(201).json({
      msg: "moto registrada",
      data: data,
    });
  } catch (error) {
    console.log(error);

    if (error.code === 11000) {
      const repeatedValue = Object.entries(error.keyValue);

      return res.status(400).json({
        msg: "Ingrese un objeto sin propiedades repetidas",
        repeated: repeatedValue,
        error: error.errors,
      });
    }

    res.status(501).json({
      msg: "no se pudo registrar la moto",
    });
  }
}
async function deleteMc(req, res) {
  try {
    let { motorcycleId } = req.params;

    //VALIDACION DEFENSIVA

    if (!mongoose.Types.ObjectId.isValid(motorcycleId)) {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    let deletedMotorcycle = await dbDeleteMotorcycle(motorcycleId);

    //VALIDACION DIRECTA

    if (!deletedMotorcycle) {
      return res.status(400).json({
        msg: "No se puede elminar un motocicleta que no se encuentra registrada",
      });
    }

    res.json({
      msg: "Motocicleta eliminada",
      deletedMotorcycle: deletedMotorcycle,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo eliminar la motocicleta",
    });
  }
}
async function getMcByUserId(req, res) {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    const motorcycles = await dbGetMotorcycleByUserId(userId);

    if (!motorcycles) {
      return res.status(400).json({
        msg: "El usuario no tiene motos registradas",
      });
    }

    res.json({
      msg: "motos",
      motorcycles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo traer la motocicleta",
    });
  }
}

export { getMc, patchMc, createMc, deleteMc, getMcById, getMcByUserId};
