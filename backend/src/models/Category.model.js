import { Schema, model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    description: String,
    registeringUserId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required:true
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const CategoryModel = model("categories", CategorySchema);

export default CategoryModel;
