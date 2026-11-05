import { ROLES } from "../config/global.config.js";

const STAFF_ROLES = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE];

const isOwnerOrStaff = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      const { _id: authUserId, rol } = req.payload;

      if (STAFF_ROLES.includes(rol)) {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);

      if (!resourceUserId) {
        return res.status(404).json({ msg: "Recurso no encontrado" });
      }

      if (resourceUserId.toString() !== authUserId.toString()) {
        return res.status(403).json({
          msg: "No tienes permiso para operar sobre este recurso",
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error de autorización" });
    }
  };
};

export { isOwnerOrStaff, STAFF_ROLES };