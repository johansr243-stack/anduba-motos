import { Schema, model } from "mongoose";

const ServiceRecordSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    observations: {
      type: String,
      trim: true,
    },
    mechanic: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    usedProducts: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],
    finalCost: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const ServiceRecordModel = model("servicesRecord", ServiceRecordSchema);

export default ServiceRecordModel;
