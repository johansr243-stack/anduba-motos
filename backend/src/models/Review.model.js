import { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const ReviewModel = model("reviews", ReviewSchema);

// Refuerza a nivel de base de datos la regla de "una sola review por usuario
// por producto" (antes solo se validaba en el controlador, lo que puede
// fallar si llegan dos peticiones al mismo tiempo).
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default ReviewModel;
