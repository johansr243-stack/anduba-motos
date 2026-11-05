//Este archivo tiene la funcion de hablar con la base de datos
import Usermodel from "../models/User.model.js";

const insertUser = async (newUser) => {
  return await Usermodel.create(newUser);
};

const dbGetUsers = async () => {
  return await Usermodel.find().select("-password")
};

const dbGetUsersbyId = async (userID) => {
  return await Usermodel.findOne({ _id: userID });
};

const dbDeleteuser = async (userID) => {
  return await Usermodel.findByIdAndDelete(userID);
};

const dbUpdateUser = async (userID, updateData) => {
  return await Usermodel.findByIdAndUpdate(userID, updateData, {
    returnDocument: "after",
  });
};

const dbGetUserbyUsername = async (username) => {
  if (!username) {
    throw new Error("Ingrese su Username");
  }
  return await Usermodel.findOne({ username: username, status:'active' },);
};

// Busqueda tipo "typeahead": trae solo unos pocos usuarios que calzan con
// el termino (username, nombre o apellido), en vez de traer todos los
// usuarios como hacia el front antes. Solo usuarios activos.
const dbSearchUsers = async (term = "", rol, limit = 10) => {
  const filter = { status: "active" };

  if (rol) {
    filter.rol = rol;
  }

  if (term) {
    // Escapa caracteres especiales de regex para que el termino se busque
    // literalmente y no rompa la consulta (ej. si alguien busca "a.b").
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedTerm, "i");
    filter.$or = [{ username: regex }, { firstName: regex }, { lastName: regex }];
  }

  return await Usermodel.find(filter)
    .select("-password")
    .limit(Number(limit) || 10);
};

export {
  insertUser,
  dbGetUsers,
  dbDeleteuser,
  dbUpdateUser,
  dbGetUsersbyId,
  dbGetUserbyUsername,
  dbSearchUsers,
};

