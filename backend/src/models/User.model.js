import { Schema, model } from "mongoose";
import { ALLOWED_ROLES, ROLES } from "../config/global.config.js";

// 1. Definir esquema

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      maxlength: 50,
    },
    middleName: {
      type: String,
      maxlength: 50,
    },
    lastName: {
      type: String,
      maxlength: 50,
      required: true,
    },
    secondLastName: {
      type: String,
      maxlength: 50,
    },
    username: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      unique: [true, "El nombre de usuario debe ser unico"],
    },
    document: {
      type: String,
      required: true,
      maxlength: 16,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      maxlength: 13,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    rol: {
      type: String,
      enum: ALLOWED_ROLES,
      default: ROLES.CLIENT,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      carrera: {
        type: String,
        required: true,
      },
      neighborhood: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      department: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    birthDate: {
      type: Date,
      required: true,
      max: [
        function () {
          const fecha = new Date();
          fecha.setFullYear(fecha.getFullYear() - 18);
          return fecha;
        },
        "El usuario debe tener al menos 18 años.",
      ],
    },
    status: {
      enum: ["active", "inactive", "banned"],
      type: String,
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    resetPasswordCode: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

// 2. Definir modelo

const Usermodel = model(
  "users", // Define la coleccion que almacenara el objeto creado
  UserSchema, // Asocia la estructura
);

export default Usermodel;
