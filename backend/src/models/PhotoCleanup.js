import mongoose from "mongoose";

// A durable outbox: do not use TTL, because failed deletions must remain retryable.
const schema = new mongoose.Schema({
  _id: String,
  dueAt: { type: Date, required: true, index: true },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("PhotoCleanup", schema);
