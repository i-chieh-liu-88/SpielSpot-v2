import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    playgroundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playground",
      required: true,
    },
    playgroundName: { type: String, trim: true },
    location: { type: String, trim: true },
    ageGroup: { type: String, trim: true },
    facilities: { type: [String], default: [] },
    safetyRating: { type: String, trim: true },
    overallRating: { type: String, trim: true },
    recommendation: { type: String, trim: true },
    review: { type: String, trim: true, required: true },
    parentName: { type: String, trim: true },
    authorId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Review", reviewSchema);
