import mongoose from "mongoose";
import { dbGetProductbyId } from "../services/product.service.js";
import {
  registerReview,
  dbGetReviews,
  dbGetReviewsByProduct,
  dbGetReviewById,
  dbFindReviewByUserAndProduct,
  dbUpdateReview,
  dbDeleteReview,
  dbAddReviewToProduct,
  dbRemoveReviewFromProduct,
  recalculateAvgStars,
} from "../services/review.service.js";

const getReviews = async (req, res) => {
  try {
    const reviews = await dbGetReviews();

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({
        msg: "No hay reviews registradas",
      });
    }

    res.json({
      msg: "Lista de reviews",
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "No se pudieron obtener las reviews",
    });
  }
};

const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        msg: "Ingrese un id de producto valido",
      });
    }

    const reviews = await dbGetReviewsByProduct(productId);

    res.json({
      msg: "Reviews del producto",
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "No se pudieron obtener las reviews del producto",
    });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    const review = await dbGetReviewById(reviewId);

    if (!review) {
      return res.status(404).json({
        msg: "La review no existe",
      });
    }

    res.json({
      msg: "Review",
      review: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "No se pudo traer la review",
    });
  }
};

const createReview = async (req, res) => {
  try {
    const inputData = req.body;
    inputData.user = req.payload._id; // el autor siempre es quien esta logeado, no lo que mande el body

    if (!mongoose.Types.ObjectId.isValid(inputData.product)) {
      return res.status(400).json({
        msg: "Ingrese un id de producto valido",
      });
    }

    const product = await dbGetProductbyId(inputData.product);

    if (!product) {
      return res.status(404).json({
        msg: "El producto que intenta resenar no existe",
      });
    }

    const alreadyReviewed = await dbFindReviewByUserAndProduct(
      inputData.product,
      inputData.user,
    );

    if (alreadyReviewed) {
      return res.status(409).json({
        msg: "Ya dejaste una review para este producto",
      });
    }

    const review = await registerReview(inputData);
    await dbAddReviewToProduct(inputData.product, review._id);
    const avgStars = await recalculateAvgStars(inputData.product);
    await review.populate("user", "username");

    res.status(201).json({
      msg: "Review creada",
      data: review,
      avgStars: avgStars,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        msg: "Datos invalidos para crear la review",
        detail: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        msg: "Ya dejaste una review para este producto",
      });
    }

    res.status(500).json({
      msg: "No se pudo crear la review",
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const updateData = req.body;

    // el autor y el producto de una review no se cambian, solo se corrige el contenido
    delete updateData.user;
    delete updateData.product;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    const updatedReview = await dbUpdateReview(reviewId, updateData);

    if (!updatedReview) {
      return res.status(404).json({
        msg: "La review que intenta actualizar no existe",
      });
    }

    const avgStars = await recalculateAvgStars(updatedReview.product);

    res.json({
      msg: "Review actualizada",
      updatedReview: updatedReview,
      avgStars: avgStars,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    res.status(500).json({
      msg: "No se pudo actualizar la review",
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        msg: "Ingrese un id valido",
      });
    }

    const deletedReview = await dbDeleteReview(reviewId);

    if (!deletedReview) {
      return res.status(404).json({
        msg: "La review que intenta eliminar no existe",
      });
    }

    await dbRemoveReviewFromProduct(deletedReview.product, deletedReview._id);
    const avgStars = await recalculateAvgStars(deletedReview.product);

    res.json({
      msg: "Review eliminada",
      deletedReview: deletedReview,
      avgStars: avgStars,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "No se pudo eliminar la review",
    });
  }
};

export {
  getReviews,
  getReviewsByProduct,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
