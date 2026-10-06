import express from "express";
import { deleteReview, updateReview } from "../controllers/reviewController.js";
import { requireLogin } from "../middleware/requireLogin.js";
import { validate } from "../middleware/validate.js";
import { reviewSchema } from "../validators/reviewValidator.js";

const router = express.Router();

router.patch(
  "/:id",
  requireLogin,
  validate(reviewSchema.partial()), //.partial() 讓 PATCH 時只改部分欄位也能通過驗證
  updateReview,
);
router.delete("/:id", requireLogin, deleteReview);

export default router;

//這個是獨立掛在 /api/reviews，不是巢狀在 playground 底下，因為編輯/刪除不需要知道屬於哪個 playground
