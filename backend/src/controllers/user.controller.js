import mongoose from "mongoose";
import {
  dbDeleteuser,
  dbGetUsers,
  dbGetUsersbyId,
  dbUpdateUser,
  insertUser,
  dbSearchUsers,
} from "../services/user.service.js";
import { encryptedPassword } from "../helpers/bcrypt.helper.js";

async function getUsers(req, res) {
  try {
    const data = await dbGetUsers();

    if (!data || data.length === 0) {
      return res.status(400).json({
        msg: "No hay usuarios registrados",
      });
    }

    res.json({
      msg: "Lista de todos los usuarios",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo obtener los usuarios",
    });
  }
}
async function getUsersbyId(req, res) {
  try {
    const userID = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({
        msg: "Ingrese un Id valido",
      });
    }

    let user = await dbGetUsersbyId(userID);

    if (!user) {
      return res.status(400).json({
        msg: "El usuario no existe",
      });
    }

    user = user.toObject();
    delete user.password;

    res.json({
      msg: "Usuario",
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo obtener el usuario",
    });
  }
}
async function searchUsers(req, res) {
  try {
    const { q = "", rol, limit } = req.query;

    // Con menos de 2 caracteres no vale la pena consultar la base de datos
    if (!q || q.trim().length < 2) {
      return res.json({
        msg: "Resultados de búsqueda",
        data: [],
      });
    }

    const data = await dbSearchUsers(q.trim(), rol, limit);

    res.json({
      msg: "Resultados de búsqueda",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "No se pudo buscar usuarios",
    });
  }
}
async function patchUsers(req, res) {
  try {
    const id = req.params.userID;

    const updateData = req.body;

    if (!updateData) {
      return res.status(400).json({
        msg: "Tiene que ingresar por lo menos 1 dato para actualizar el usuario",
      });
    }

    const updated = await dbUpdateUser(id, updateData);

    if (!updated) {
      throw new Error("El usuario no existe");
    }

    res.json({
      msg: "Usuario editado",
      user: updated,
    });
  } catch (error) {
    console.log(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "Ingrese un Id valido",
      });
    }

    if (error.message.includes("El usuario no existe")) {
      return res.status(400).json({
        msg: error.message,
      });
    }
    res.status(500).json({
      msg: "No se pudo actualizar el usuario",
    });
  }
}
async function createUsers(req, res) {
  try {
    const inputData = req.body; //Objeto JSON eviado en el request

    if (!inputData) {
      return res.status(400).json({
        msg: "Tiene que ingresar datos para crear el usuario",
      });
    }

    //Se encripta la contraseña

    const password = encryptedPassword(inputData.password);

    if (password === null) {
      throw new Error("Olvido agregar propiedad password en el login");
    }

    inputData.password = password;

    // req.payload solo existe si un usuario autenticado (admin/owner) esta
    // creando la cuenta. En el auto-registro publico (/api/auth/register)
    // no hay usuario autenticado, por lo que no se debe asumir req.payload._id.
    if (req.payload?._id) {
      inputData.createdBy = req.payload._id;
    }

    const createdUser = await insertUser(inputData); //registra el usuario y guarda los datos en la variable

    res.status(201).json({
      createdUser: createdUser, //muestra el objeto JSON en la propiedad de inputData
    });
  } catch (error) {
    console.log("Nombre del error:", error.name);
    console.log("Código del error:", error.code);
    console.log(error.message); //respuesta consola

    if (error.code === 11000) {
      const repeatedValue = Object.entries(error.keyValue);

      return res.status(400).json({
        msg: "Ingrese un usuario sin repetir lo siguientes datos:",
        repeatedValue: repeatedValue,
      });
    }
    if (error.name === "ValidationError") {
      const mensajes = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");

      return res.status(400).json({
        msg: mensajes,
      });
    }

    if (error.name == "MongooseError") {
      return res.status(400).json({
        msg: error.message, //respuesta al cliente
      });
    }

    res.status(500).json({
      msg: "No se pudo registar el usuario", //respuesta al cliente
    });
  }
}
async function deleteUsers(req, res) {
  try {
    const id = req.params.userID;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "Ingrese un Id valido",
      });
    }

    const deletedUser = await dbDeleteuser(id);

    if (!deletedUser) {
      return res.status(400).json({
        msg: "El usuario no existe",
      });
    }

    res.json({
      msg: "Usuario eliminado",
      deleted_user: deletedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "no se pudo eliminar el usuario",
    });
  }
}

export { getUsers, createUsers, deleteUsers, patchUsers, getUsersbyId, searchUsers };
