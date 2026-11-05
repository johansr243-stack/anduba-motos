import ReviewModel from "../models/Review.model.js";
import ProductModel from "../models/Product.model.js";

const registerReview = async (newReview) => {
  return await ReviewModel.create(newReview);
};

const dbGetReviews = async () => {
  return await ReviewModel.find()
    .populate("user", "username")
    .populate("product", "name");
};

const dbGetReviewsByProduct = async (productId) => {
  return await ReviewModel.find({ product: productId }).populate(
    "user",
    "username",
  );
};

const dbGetReviewById = async (reviewId) => {
  return await ReviewModel.findOne({ _id: reviewId });
};

const dbFindReviewByUserAndProduct = async (productId, userId) => {
  return await ReviewModel.findOne({ product: productId, user: userId });
};

const dbUpdateReview = async (reviewId, updateData) => {
  return await ReviewModel.findByIdAndUpdate(reviewId, updateData, {
    returnDocument: "after",
  });
};

const dbDeleteReview = async (reviewId) => {
  return await ReviewModel.findByIdAndDelete(reviewId);
};

const dbAddReviewToProduct = async (productId, reviewId) => {
  return await ProductModel.findByIdAndUpdate(productId, {
    $push: { reviews: reviewId },
  });
};

const dbRemoveReviewFromProduct = async (productId, reviewId) => {
  return await ProductModel.findByIdAndUpdate(productId, {
    $pull: { reviews: reviewId },
  });
};


const recalculateAvgStars = async (productId) => {
  const reviews = await ReviewModel.find({ product: productId }).select(
    "stars",
  );

  const avgStars = reviews.length
    ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length
    : 0;

  await ProductModel.findByIdAndUpdate(productId, { avgStars });

  return avgStars;
};

export {
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
};
