import { Schema, model } from "mongoose";

//1ra parte: definir el esquema

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tiene que ingresar un nombre"],
      trim: true,
      unique: true,
    },
    nr: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "categories",
    },
    description: String,
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    roi: {
      type: Number,
      default: 0.3,
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "disponible",
        "no disponible",
        "agotado",
        "refactorizado",
        "pendiente",
      ],
      default: "disponible",
      required: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "reviews",
      },
    ],
    avgStars: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    productImages: {
      type: [String],
      default: [
        "https://preview.redd.it/choosing-your-first-a2-sport-bike-yamaha-r7-honda-cbr500r-v0-2dzuowcq0ief1.jpg?width=640&crop=smart&auto=webp&s=f03f5ebd577adb1dee760680d25c4150923afb3c",
      ],
      validate: {
        validator: function (arr) {
          return arr.length <= 6;
        },
        message: "Un producto no puede tener más de 6 imágenes",
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

//2da parte: definir el modelo

const ProductModel = model(
  "products", // define el nombre de la coleccion que almacenara el objeto creado con este Schema
  productSchema, // asocia la estructura de datos a la coleccion
);

export default ProductModel;
