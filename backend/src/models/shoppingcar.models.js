import { Schema, model } from "mongoose";

const shoppingcarSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true, // un solo carrito por usuario
    },

    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      minlength: 7,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);



const shoppingcarmodel = model(
  "shoppingcar", // define el nombre de la coleccion que almacenara el objeto creado con este Schema
  shoppingcarSchema, // asocia la estructura de datos a la coleccion
);

export default shoppingcarmodel;