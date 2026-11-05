import { model, Schema } from "mongoose";

// Model crea la estructura de los datos que se van a guardar en la base de datos, en este caso, la colección de citas (appointments

const AppointmentSchema = new Schema(

  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required:true
    },

    schedule: {
      type: Date,
      required: [true, "La fecha de la cita es obligatoria"],//campos de tiempo
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "services",
      required:true
    },
    motorcycle: {
      type: Schema.Types.ObjectId,
      ref: "Motorcycles",
      required:true
    },
    registeringUserId: {
      type: Schema.Types.ObjectId,
      ref: "users"
    },
    status: {
      type: String,
      enum: ["confirmada", "aplazada", "cancelada"],
      default: "confirmada",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }, // createdAt - updatedAt
);

// El modelo: Asociacion entre la estructura de datos y la coleccion donde voy a guardar los datos

const AppointmentModel = model(
  "appointment", // Define el nombre de la coleccion donde voy a guardar los dcoumentos
  AppointmentSchema,
);

export default AppointmentModel;
