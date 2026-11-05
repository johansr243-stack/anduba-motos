import { Schema, model } from "mongoose";

const MotorcycleSchema = new Schema(
  {
    licensePlate: {
      type: String,
      required: [true, "La placa es obligatoria"],
      uppercase: true,
      trim: true,
      maxlength: 6,
      unique: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    modelName: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    registeringUserId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required:true
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const MotorcycleModel = model("Motorcycles", MotorcycleSchema);

export default MotorcycleModel;
