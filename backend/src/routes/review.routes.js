import { Router } from "express";
import {
  getReviews,
  getReviewsByProduct,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import authenticationUser from "../middlewares/authentication.middleware.js";
import { isOwnerOrStaff } from "../middlewares/ownership.middleware.js";
import { dbGetReviewById } from "../services/review.service.js";

const router = Router();


router.get("/", getReviews);
router.get("/product/:productId", getReviewsByProduct);
router.get("/:reviewId", getReviewById);


router.post("/", authenticationUser, createReview);


router.patch(
  "/:reviewId",
  authenticationUser,
  isOwnerOrStaff(async (req) => {
    const review = await dbGetReviewById(req.params.reviewId);
    return review?.user;
  }),
  updateReview,
);

router.delete(
  "/:reviewId",
  authenticationUser,
  isOwnerOrStaff(async (req) => {
    const review = await dbGetReviewById(req.params.reviewId);
    return review?.user;
  }),
  deleteReview,
);

export default router;
