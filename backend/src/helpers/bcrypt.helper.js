import { hashSync, genSaltSync, compareSync } from "bcrypt";

const encryptedPassword = (originalPassword) => {
  //Paso 1: Generar una cadena aleatoria (salt)
  try {
    const salt = genSaltSync(6); //NO CAMBIAR EL 6 DEPUES PROBLEMAS CON LA BASE DE DATOS

    const hashPassword = hashSync(originalPassword, salt);

    console.log(salt);

    return hashPassword;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const validatePassword = (originalPassword, hashPassword) => {
  try {
    const isValid = compareSync(originalPassword, hashPassword);

    return isValid;
  } catch (error) {
    console.log(error)
    return null
  }
};

export { encryptedPassword, validatePassword };
