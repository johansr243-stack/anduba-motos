import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    unitCost: {
      type: Number,
    },
  },
  {
    _id: false
  },
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    products: [orderItemSchema],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "canceled"],
      default: "pending",
    },
    direccionEnvio: {
      type: String,
    },
    metodoPago: {
      type: String,
      enum: ["cash", "card", "transfer"],
    },
  },
  {
    timestamps: true,
    versionKey:false
  },
);

const OrderModel = model("orders", orderSchema);

export default OrderModel;
