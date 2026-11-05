import { model, Schema } from "mongoose";

const HistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "orders" }],
    services: [{ type: Schema.Types.ObjectId, ref: "servicesRecord" }],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const HistoryModel = model("history", HistorySchema);

export default HistoryModel;
