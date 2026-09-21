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
    const review = await Review.create({
      ...req.body,
      playgroundId: req.params.id,
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
