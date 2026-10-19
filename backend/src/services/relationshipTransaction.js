import mongoose from "mongoose";
import Playground from "../models/Playground.js";

// Every Mongoose operation awaited inside the callback joins this transaction.
// Keep the callback sequential and free of HTTP/cloud side effects: it may retry.
mongoose.set("transactionAsyncLocalStorage", true);
export function runRelationshipTransaction(work) {
  return mongoose.connection.transaction(work, {
    readPreference: "primary",
    readConcern: { level: "snapshot" },
    writeConcern: { w: "majority" },
  });
}
export async function lockPlayground(id) {
  // A real increment is essential: a no-op update does not establish the lock.
  const result = await Playground.updateOne({ _id: id }, { $inc: { relationshipRevision: 1 } });
  if (result.matchedCount !== 1) throw relationshipError(404, "Playground not found");
}
export function relationshipError(status, message) {
  return Object.assign(new Error(message), { status, relationship: true });
}
