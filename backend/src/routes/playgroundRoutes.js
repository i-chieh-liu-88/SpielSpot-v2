import express from "express";
import {
  getPlaygrounds,
  getPlaygroundById,
  createPlayground,
} from "../controllers/playgroundController.js";
import {
  getReviewsForPlayground,
  createReview,
} from "../controllers/reviewController.js";

const router = express.Router();

//PLAYGROUND ROUTES
router.get("/", getPlaygrounds);
router.get("/:id", getPlaygroundById);
router.post("/", createPlayground);

//REVIEW ROUTES
router.get("/:id/reviews", getReviewsForPlayground);
router.post("/:id/reviews", createReview);

export default router;
