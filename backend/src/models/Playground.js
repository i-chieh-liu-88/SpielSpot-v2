import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    ownerId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }, // 自動產生 createdAt / updatedAt
);

const playgroundModel = mongoose.model(
  "playgroundModel",
  playgroundSchema,
  "playgrounds",
);

export default playgroundModel;
