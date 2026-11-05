const removeRole = (req, res, next) => {
  const inputData = req.body;

  delete inputData.rol;

  next();
};

export { removeRole };