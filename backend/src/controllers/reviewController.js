import { getAuth } from "@clerk/express";
import Review from "../models/Review.js";

export async function getReviewsForPlayground(req, res) {
  try {
    const reviews = await Review.find({ playgroundId: req.params.id });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid playground id" });
  }
}

export async function createReview(req, res) {
  try {
    const { userId } = getAuth(req);
    const review = await Review.create({
      ...req.body,
      playgroundId: req.params.id,
      authorId: userId,
    }); //authorId: userId 放最後，蓋掉任何前端傳來的 authorId
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

//DELETE
export async function deleteReview(req, res) {
  try {
    const { userId } = getAuth(req);
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, error: "Review not found" });
    }
    if (review.authorId !== userId) {
      return res
        .status(403)
        .json({ success: false, error: "Not allowed to delete this review" });
    }

    await review.deleteOne();
    res.json({ success: true, data: null });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
