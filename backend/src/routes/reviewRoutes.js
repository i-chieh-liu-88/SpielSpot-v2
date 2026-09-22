import express from "express";
import { deleteReview } from "../controllers/reviewController.js";
import { requireLogin } from "../middleware/requireLogin.js";

const router = express.Router();

router.delete("/:id", requireLogin, deleteReview);

export default router;

//這個是獨立掛在 /api/reviews，不是巢狀在 playground 底下，因為刪除不需要知道屬於哪個 playground
