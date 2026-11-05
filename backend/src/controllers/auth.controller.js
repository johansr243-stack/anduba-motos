import { validatePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";
import { dbGetUserbyUsername } from "../services/user.service.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.model.js'
import sendResetCodeEmail from "../helpers/mailer.js";


const loginUser = async (req, res) => {
  try {
    const inputData = req.body; // toma el usuario y contraseña

    // 2.Verificar si el usuario exisite

    if (!inputData.password) {
      throw new Error("Ingrese la contraseña");
    }

    const dbUser = await dbGetUserbyUsername(inputData.username);

    if (!dbUser) {
      console.log(dbUser);
      throw new Error("El usuario no existe, por favor registrese");
    }

    // 3. Verificar si la contraseña es valida

    const validatedPassword = validatePassword(
      inputData.password,
      dbUser.password,
    );

    if (!validatedPassword) {
      throw new Error("Contraseña incorrecta");
    }

    // 4. Generar el token

    const payload = {
      _id: dbUser._id,
      email: dbUser.email,
      username: dbUser.username,
      rol: dbUser.rol,
      status: dbUser.status,
    };

    const token = generateToken(payload);

    if (token === null) {
      throw new Error("No se pudo generar el token de acceso");
    }

    // 5.Convertir un BJSON a JSON para eliminar password

    const dbUserObject = dbUser.toObject();

    delete dbUserObject.password;

    // 6.responde al cliente

    res.json({
      msg: "login exitoso",
      token,
      data: dbUserObject,
    });
  } catch (error) {
    console.log(error);

    if (
      error.message.includes("Ingrese") ||
      error.message.includes("Contraseña incorrecta") ||
      error.message.includes("El usuario no existe")
    ) {
      return res.status(400).json({
        msg: error.message,
      });
    }

    if (error.message.includes("No se pudo generar el token de acceso")) {
      return res.status(500).json({
        msg: error.message,
      });
    }
    res.status(500).json({
      msg: "Ocurrió un error en el servidor durante el login",
    });
  }
};

const renewToken = async (req, res, next) => {
  // 1.Obtener los datos del usuario y la carga util de middleware

  const payload = req.payload;

  const user = req.user;

  //2. verificar que el usuario que se va a generar el nuevo token y esta activo

  const dbUser = await dbGetUserbyUsername(payload.username);

  if (!dbUser) {
    return res.status(400).json({
      msg: "No se renueva el token porque el usuario ha sido eliminado, o su estado es inactivo",
    });
  }

  // 3.Generar nuevo token a partir de los datos registrados en la base de datos

  const newPayload = {
    _id: dbUser._id,
    email: dbUser.email,
    username: dbUser.username,
    rol: dbUser.rol,
    status: dbUser.status,
  };

  const token = generateToken(newPayload);

  const userFoundObj = dbUser.toObject();

  delete userFoundObj.password;
  delete userFoundObj.createdAt;
  delete userFoundObj.updatedAt;

  res.json({
    msg: "Token renovado",
    token,
    data: userFoundObj,
  });
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'Si el correo existe, se envió un código.' });
    }

    const code = crypto.randomInt(1000, 10000).toString(); // 4 dígitos
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    await sendResetCodeEmail(user.email, code);

    return res.status(200).json({ message: 'Si el correo existe, se envió un código.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
};

// PASO 2: verificar código
 const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    return res.status(200).json({ message: 'Código válido' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al verificar el código', error: error.message });
  }
};

// PASO 3: cambiar contraseña
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar la contraseña', error: error.message });
  }}
export { loginUser, renewToken, resetPassword, verifyResetCode, requestPasswordReset  };
