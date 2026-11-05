// controller se encarga de manejar las peticiones y las respuestas de los clientes

import mongoose from "mongoose";

import {
  dbGetCategory,
  dbinsertCategory,
  dbdeleteCategory,
  dbpatchCategory,
  dbGetCategoryByid,
} from "../services/category.service.js";

const getCategory = async (req, res) => {
  try {
    const data = await dbGetCategory();

    res.json({
      msg: "obtener todos las categorias",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error: no se pudo obtener las categorias",
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const inputData = req.body;
    inputData.registeringUserId = req.payload._id
    const createdCategory = await dbinsertCategory(inputData);

    res.status(201).json({
      createdCategory: createdCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "no se pudo crear la categoria",
    });
  }
};

const patchCategory = async (req, res) => {
  try {
    const id = req.params.id; // id de la ruta para encontrar el documento que quiero actualizar
    const inputData = req.body; // obteniendo el objeto con el/los parametros que quiero actualizar

    const data = await dbpatchCategory(id, inputData); //el objeto con las propiedades y los valores que deseamos actualizar

    if (!data) {
      return res.json({
        msg: "no se puede actualizar una categoria que no se encuentra registrada",
      });
    }

    res.status(200).json({
      msg: "se actualizo la categoria",
      data: data,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "no se pudo actualizar la categoria, porque el id es invalido",
      });
    }

    if (
      error.message.includes(
        "no se pudo actualizar la categoria porque no se encuentra registrada",
      )
    ) {
      return res.json({
        msg: error.message,
      });
    }

    res.status(500).json({
      msg: "no se pudo actualizar la categoria",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "Id proporcionado para eliminar no es valido",
      });
    }

    const data = await dbdeleteCategory(id);

    // console.log( data);

    // if( ! data) {
    //     return res.json({
    //         msg: 'no se puede eliminar una categoria que no se encuentra registrada'
    //     })
    // }

    res.status(200).json({
      msg: "eliminar categoria",
      data: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "error: no se pudo eliminar la categoria",
    });
  }
};

const getCategoryByid = async (req, res) => {
  try {
    const id = req.params.id; // id de la ruta para encontrar el documento que quiero actualizar

    const data = await dbGetCategoryByid(id); //el objeto con las propiedades y los valores que deseamos actualizar.

    if (!data) {
      if (!data) {
        return res.json({
          msg: "no se puede obtener una category que no se encuentra registrado",
        });
      }
    }

    res.status(200).json({
      msg: "mnakdbh",
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
  getCategory,
  createCategory,
  deleteCategory,
  patchCategory,
  getCategoryByid,
};
