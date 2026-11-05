import dbGetRoles from "../services/roles.service.js";

const getRoles = (req, res) => {

  const roles = dbGetRoles() 
  res.json({
    msg: "Roles para la aplicaciòn",
    roles
  });
};

export default getRoles;
