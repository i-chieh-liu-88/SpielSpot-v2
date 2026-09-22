import express from "express";
import { getAuth } from "@clerk/express";
import { requireLogin } from "../middleware/requireLogin.js";
import {
  getPlaygrounds,
  getPlaygroundById,
  createPlayground,
  updatePlayground,
  deletePlayground,
} from "../controllers/playgroundController.js";
import {
  getReviewsForPlayground,
  createReview,
} from "../controllers/reviewController.js";
//ZOD VALIDATION
import { validate } from "../middleware/validate.js";
import { playgroundSchema } from "../validators/playgroundValidator.js";
import { reviewSchema } from "../validators/reviewValidator.js";

const router = express.Router();

//PLAYGROUND ROUTES
router.get("/", getPlaygrounds);
router.get("/:id", getPlaygroundById);
router.post("/", requireLogin, validate(playgroundSchema), createPlayground);
router.patch(
  "/:id",
  requireLogin,
  validate(playgroundSchema.partial()),
  updatePlayground,
); //.partial() 是 Zod 很好用的功能，讓 PATCH 時所有欄位都變成「有填才檢查」，不用因為只改一個欄位就被要求把 name、address 全部重填一次。
router.delete("/:id", requireLogin, deletePlayground);

//REVIEW ROUTES
router.get("/:id/reviews", getReviewsForPlayground);
router.post("/:id/reviews", requireLogin, validate(reviewSchema), createReview);

export default router;
