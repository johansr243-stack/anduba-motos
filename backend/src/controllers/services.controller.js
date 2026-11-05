// controller se encarga de manejar las peticiones y las respuestas de los clientes

import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import {
  dbinsertService,
  dbGetServices,
  dbdeleteservice,
  dbpatchservice,
  dbGetServicesByid,
} from "../services/service.service.js";

const createServices = async (req, res) => {
  try {
    const inputData = req.body;

    inputData.registeringUserId = req.payload._id;

    if (req.file) {
      // Ruta relativa (igual que productos): el front arma la URL completa
      // con el pipe `imageUrl`, contra el servidor donde esté corriendo en
      // ese momento. Si acá se guarda la URL absoluta (protocolo + host),
      // queda "quemado" el host de cuando se creó el servicio, y se rompe
      // en cuanto el proyecto se mueve a otro servidor (ej: AWS).
      inputData.serviceImage = `/uploads/${req.file.filename}`;
    }

    const createdService = await dbinsertService(inputData);

    res.status(201).json({
      createdService: createdService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "no se pudo crear el servicio",
    });
  }
};

const getServices = async (req, res) => {
  try {
    const data = await dbGetServices();

    res.json({
      msg: "obtener todos los servicios",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error: no se pudo obtener el listado de productos",
    });
  }
};

const patchServices = async (req, res) => {
  try {
    const id = req.params.idservice;
    const inputData = req.body;

    // El front manda este flag cuando el usuario quita la imagen actual
    // sin elegir una nueva (ver service-form.ts, onSubmit).
    const wantsRemoveExisting = inputData.removeImage === "true";
    delete inputData.removeImage;

    if (req.file || wantsRemoveExisting) {
      // Un servicio solo tiene 1 imagen: si va a cambiar o a borrarse,
      // hay que borrar del disco la que tenía para no dejar archivos
      // huérfanos acumulándose en /uploads.
      const currentService = await dbGetServicesByid(id);

      if (currentService?.serviceImage) {
        const filename = currentService.serviceImage.split("/uploads/")[1];
        if (filename) {
          fs.unlink(path.join("uploads", filename), (err) => {
            if (err) console.error("No se pudo borrar", filename, err);
          });
        }
      }

      if (req.file) {
        inputData.serviceImage = `/uploads/${req.file.filename}`;
      } else if (wantsRemoveExisting) {
        inputData.serviceImage = "";
      }
    }

    const data = await dbpatchservice(id, inputData);
    // ...resto igual//el objeto con las propiedades y los valores que deseamos actualizar

    if (!data) {
      // creo una excepcion (falsa)
      throw new Error(
        "no se pudo actualizar el producto porque no se encuentra registrado",
      ); // yo creo un error(y crea una excepcion)
    }

    if (!data) {
      if (!data) {
        return res.json({
          msg: "no se puede actualizar un servicio que no se encuentra registrado",
        });
      }
    }

    res.status(200).json({
      msg: "se actualizo el servicio",
      data: data,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "no se pudo actualizar el producto, porque el id es invalido",
      });
    }

    if (
      error.message.includes(
        "no se pudo actualizar el producto porque no se encuentra registrado",
      )
    ) {
      return res.json({
        msg: error.message,
      });
    }

    res.status(500).json({
      msg: "no se pudo actualizar el producto",
    });
  }
};

const deleteServices = async (req, res) => {
  try {
    const id = req.params.idservice;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "no se puede eliminar porque el ID proporcionado es invalido",
      });
    }

    const data = await dbdeleteservice(id);

    if (!data) {
      if (!data) {
        return res.json({
          msg: "no se ´puede eliminar un servicio que no se encuentra registrado",
        });
      }
    }

    // Borra del disco la imagen del servicio eliminado, igual que se hace
    // al reemplazarla/quitarla en patchServices.
    if (data.serviceImage) {
      const filename = data.serviceImage.split("/uploads/")[1];
      if (filename) {
        fs.unlink(path.join("uploads", filename), (err) => {
          if (err) console.error("No se pudo borrar", filename, err);
        });
      }
    }

    res.status(200).json({
      msg: "eliminar usuario",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "error: no se pudo eliminar el servicio",
    });
  }
};

const getServicesByid = async (req, res) => {
  try {
    const id = req.params.idservice; // id de la ruta para encontrar el documento que quiero actualizar

    const data = await dbGetServicesByid(id); //el objeto con las propiedades y los valores que deseamos actualizar.

    if (!data) {
      if (!data) {
        return res.json({
          msg: "no se puede obtener un servicio que no se encuentra registrado",
        });
      }
    }

    res.status(200).json({
      msg: "sbljhccvxcxzgcvxck,jhbñjkh",
      data: data,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      msg: "error: no se pudo obtener el elemento",
    });
  }
};

export {
  getServices,
  createServices,
  deleteServices,
  patchServices,
  getServicesByid,
};