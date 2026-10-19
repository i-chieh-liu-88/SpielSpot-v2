import { runRelationshipTransaction, lockPlayground, relationshipError } from "../services/relationshipTransaction.js";
import { getAuth } from "@clerk/express";
import Review from "../models/Review.js";
import Playground from "../models/Playground.js";

export async function getReviewsForPlayground(req, res) {
  try {
    const reviews = await Review.find({ playgroundId: req.params.id });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, error: "Invalid playground id" });
  }
}
/* ---------------------------------- POST ---------------------------------- */
/* ---------------------------------- POST ---------------------------------- */

export async function createReview(req, res, next) {
  try {
    const { userId } = getAuth(req);
    const review = await runRelationshipTransaction(async () => {
      const playground = await Playground.findById(req.params.id);
      if (!playground) throw relationshipError(404, "Playground not found");
      await lockPlayground(req.params.id);
      return Review.create({
        ...req.body,
        playgroundId: req.params.id,
        authorId: userId,
      });
    });
    // Respond only after commit, never inside a callback which may retry.
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.relationship) return res.status(err.status).json({ success: false, error: err.message });
    next(err);
  }
}

/* ------------------------------ UPDATE(PATCH) ----------------------------- */
/* ------------------------------ UPDATE(PATCH) ----------------------------- */
export async function updateReview(req, res, next) {
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
        .json({ success: false, error: "Not allowed to edit this review" });
    }

    Object.assign(review, req.body);
    await review.save();

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
}

/* --------------------------------- DELETE --------------------------------- */
/* --------------------------------- DELETE --------------------------------- */
export async function deleteReview(req, res, next) {
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
    next(err);
  }
}
