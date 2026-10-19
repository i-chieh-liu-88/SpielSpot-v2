// Explicit opt-in integration check. Never uses the production database name.
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import Playground from "../src/models/Playground.js";
import Review from "../src/models/Review.js";
import { lockPlayground, runRelationshipTransaction, relationshipError } from "../src/services/relationshipTransaction.js";
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });
if (process.env.ALLOW_TEMP_CONCURRENCY_DB !== "true") throw new Error("Explicit temporary database opt-in required");
const dbName = "sp_review_test_" + randomUUID().replaceAll("-", "").slice(0, 16);
let connected = false;
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve; }); return { promise, release }; };
try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName, serverSelectionTimeoutMS: 20000 });
  connected = true;
  assert.equal(mongoose.connection.name, dbName);
  await Playground.createCollection();
  await Review.createCollection();
  async function fixture() {
    return Playground.create({ name: "Isolated concurrency test", location: "Test only", latitude: 0, longitude: 0, ownerId: "test-owner" });
  }
  async function create(id, held) {
    return runRelationshipTransaction(async () => {
      const parent = await Playground.findById(id);
      if (!parent) throw relationshipError(404, "Playground not found");
      await lockPlayground(id);
      if (held) { held.locked.release(); await held.resume.promise; }
      return Review.create({ playgroundId: id, review: "Isolated test", authorId: "test-author" });
    });
  }
  async function remove(id, held) {
    return runRelationshipTransaction(async () => {
      const parent = await Playground.findById(id);
      if (!parent) throw relationshipError(404, "Playground not found");
      await lockPlayground(id);
      if (held) { held.locked.release(); await held.resume.promise; }
      if (await Review.exists({ playgroundId: id })) throw relationshipError(409, "Reviews exist");
      await parent.deleteOne();
    });
  }
  for (const first of ["create", "delete"]) {
    const parent = await fixture();
    const held = { locked: gate(), resume: gate() };
    const winner = first === "create" ? create(parent._id, held) : remove(parent._id, held);
    winner.catch(() => { held.locked.release(); held.resume.release(); });
    await held.locked.promise;
    const loser = first === "create" ? remove(parent._id) : create(parent._id);
    // Attach rejection handling before allowing either transaction to finish.
    const both = Promise.allSettled([winner, loser]);
    held.resume.release();
    const result = await both;
    assert.equal(result[0].status, "fulfilled");
    assert.equal(result[1].status, "rejected");
    assert.equal(result[1].reason.status, first === "create" ? 409 : 404);
    assert.equal(await Review.countDocuments({ playgroundId: parent._id }), first === "create" ? 1 : 0);
    assert.equal(Boolean(await Playground.exists({ _id: parent._id })), first === "create");
    console.log(first + "-first race: passed; no orphan reviews");
  }
  const parent = await fixture();
  await assert.rejects(runRelationshipTransaction(async () => {
    await lockPlayground(parent._id);
    await Review.create({ playgroundId: parent._id, review: "Rollback test", authorId: "test" });
    throw new Error("intentional rollback");
  }));
  assert.equal(await Review.countDocuments({ playgroundId: parent._id }), 0);
  assert.equal((await Playground.findById(parent._id).select("+relationshipRevision")).relationshipRevision, 0);
  console.log("rollback check: passed");
} catch (error) {
  console.error("Concurrency integration failed:", error.name, error.code ?? "");
  process.exitCode = 1;
} finally {
  if (connected) {
    assert.equal(mongoose.connection.name, dbName);
    assert.match(dbName, /^sp_review_test_[a-f0-9]{16}$/);
    await mongoose.connection.dropDatabase();
    console.log("Isolated temporary database removed");
  }
  await mongoose.disconnect();
}

