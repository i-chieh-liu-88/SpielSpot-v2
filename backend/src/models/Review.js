import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    playgroundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playground", //建立跟 Playground 的關聯，之後可以用 .populate("playgroundId") 把完整的 playground 資料一起撈出來。
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Review", reviewSchema);
