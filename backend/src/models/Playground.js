import mongoose from "mongoose";

const playgroundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    postcode: { type: String, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    ageRange: { type: String, trim: true },
    safetyRating: { type: Number, min: 1, max: 5 },
    tags: { type: [String], default: [] },
    ownerId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Playground", playgroundSchema);
