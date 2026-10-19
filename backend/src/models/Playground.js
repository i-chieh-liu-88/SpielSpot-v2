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
    imageUrl: { type: String },
    imagePublicId: { type: String, select: false },
    imageUrls: { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [], select: false },
    relationshipRevision: { type: Number, default: 0, select: false },
    photoRevision: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Playground", playgroundSchema);
