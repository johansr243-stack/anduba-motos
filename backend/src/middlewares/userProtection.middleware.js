import UserModel from "../models/User.model.js";
import { ROLES } from "../config/global.config.js";


const preventSelfDelete = (req, res, next) => {
  const { userID } = req.params;
  const authUserId = req.payload._id.toString();

  if (userID === authUserId) {
    return res.status(403).json({
      msg: "No puedes eliminar tu propia cuenta mientras estás autenticado",
    });
  }
  next();
};

const preventOwnerDeletion = async (req, res, next) => {
  const { userID } = req.params;
  const targetUser = await UserModel.findById(userID).select("rol");

  if (!targetUser) {
    return res.status(404).json({ msg: "El usuario no existe" });
  }

  if (targetUser.rol === ROLES.OWNER) {
    return res.status(403).json({
      msg: "Las cuentas con rango 'owner' no se pueden eliminar",
    });
  }

  next();
};


const preventRoleEscalation = (req, res, next) => {
  const { rol: newRol } = req.body;
  if (!newRol) return next(); 

  const { rol: authRol, _id: authUserId } = req.payload;
  const { userID } = req.params;

  if (userID === authUserId.toString()) {
    return res.status(403).json({ msg: "No puedes cambiar tu propio rango" });
  }

  if ([ROLES.OWNER, ROLES.ADMIN].includes(newRol) && authRol !== ROLES.OWNER) {
    return res.status(403).json({
      msg: "Solo un usuario con rango owner puede asignar ese rango",
    });
  }

  next();
};

export { preventSelfDelete, preventOwnerDeletion, preventRoleEscalation };