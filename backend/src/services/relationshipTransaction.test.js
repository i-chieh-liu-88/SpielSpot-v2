import { jest, afterEach, test, expect } from "@jest/globals";
import mongoose from "mongoose";
jest.unstable_mockModule("../models/Playground.js", () => ({ default: { updateOne: jest.fn() } }));
const Playground = (await import("../models/Playground.js")).default;
const { lockPlayground, runRelationshipTransaction } = await import("./relationshipTransaction.js");
afterEach(() => jest.restoreAllMocks());
test("locks by a real increment on the shared parent", async () => {
  Playground.updateOne.mockResolvedValue({ matchedCount: 1 });
  await lockPlayground("parent");
  expect(Playground.updateOne).toHaveBeenCalledWith({ _id: "parent" }, { $inc: { relationshipRevision: 1 } });
});
test("stops when deletion has removed the parent", async () => {
  Playground.updateOne.mockResolvedValue({ matchedCount: 0 });
  await expect(lockPlayground("parent")).rejects.toMatchObject({ status: 404, relationship: true });
});
test("propagates write conflicts instead of creating a review outside the transaction", async () => {
  const failure = new Error("write conflict");
  Playground.updateOne.mockRejectedValue(failure);
  await expect(lockPlayground("parent")).rejects.toBe(failure);
});
test("enables automatic sessions and uses snapshot/majority transactions", async () => {
  const work = jest.fn();
  const transaction = jest.spyOn(mongoose.connection, "transaction").mockResolvedValue("committed");
  await expect(runRelationshipTransaction(work)).resolves.toBe("committed");
  expect(mongoose.get("transactionAsyncLocalStorage")).toBe(true);
  expect(transaction).toHaveBeenCalledWith(work, {
    readPreference: "primary", readConcern: { level: "snapshot" }, writeConcern: { w: "majority" },
  });
});
test("does not fall back to nontransactional execution after failure", async () => {
  const work = jest.fn();
  jest.spyOn(mongoose.connection, "transaction").mockRejectedValue(new Error("transaction unavailable"));
  await expect(runRelationshipTransaction(work)).rejects.toThrow("transaction unavailable");
  expect(work).not.toHaveBeenCalled();
});
