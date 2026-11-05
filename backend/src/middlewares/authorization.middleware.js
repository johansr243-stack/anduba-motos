
// Closure

const authorizationUser = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const { rol } = req.payload;

      if (!rol) {
        throw new Error("No tiene perimsos definidos");
      }

      if (!allowedRoles.includes(rol)) {
        return res.status(400).json({
          msg: `el rol ${rol} no esta autorizado para esta accion`,
        });
      }

      next();
    } catch (error) {
      console.log(error);
      if (error.message.includes("No tiene perimsos definidos")) {
        return res.status(404).json({
          msg: "ERROR FATAL",
        });
      }
      res.status(500).json({
        msg: "Error de autorización del servidor",
      });
    }
  };
};

export { authorizationUser };
