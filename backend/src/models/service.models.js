import { Schema, model } from "mongoose";

//1ra parte: definir el esquema

const serviceSchema = new Schema(
  {
      name: {
      type: String,
      required: [true,'el nombre del servicio es obligatorio'], 
      trim: true,
      minlength: 3, 
      maxlength: 100, 
    },
    price: {
      type: Number,
      min: 0, 
      default: 0
    },
    description: {
      type: String, 
      trim: true,
      minlength: 7,
      maxlength: 500, 
    },
    registeringUserId:{
      type: Schema.Types.ObjectId,
      ref:"users",
      required:true
    },
    serviceImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=2070&auto=format&fit=crop', // Imagen por defecto de servicio
    },
    estimatedTime:{
      type:Number,
      required:true
      
    }
    
  },

  {
    versionKey: false,
    timestamps: true,
  },
);

//2da parte: definir el modelo

const servicemodel = model(
  "services", // define el nombre de la coleccion que almacenara el objeto creado con este Schema
  serviceSchema, // asocia la estructura de datos a la coleccion
);

export default servicemodel;
