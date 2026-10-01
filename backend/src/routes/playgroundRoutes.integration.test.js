import { jest } from "@jest/globals";
import request from "supertest";

// 1. 先 mock 掉外部依賴：資料庫 model 和 Clerk
jest.unstable_mockModule("../models/Playground.js", () => ({
  default: { find: jest.fn(), findById: jest.fn(), create: jest.fn() },
}));

jest.unstable_mockModule("../models/Review.js", () => ({
  default: { find: jest.fn(), findById: jest.fn(), create: jest.fn() },
}));

jest.unstable_mockModule("@clerk/express", () => ({
  clerkMiddleware: jest.fn(() => (req, res, next) => next()),
  getAuth: jest.fn(),
}));

// 2. mock 設定好之後，才動態載入 app 跟要控制的 mock
const { default: app } = await import("../app.js");
const Playground = (await import("../models/Playground.js")).default;
const { getAuth } = await import("@clerk/express");

const validBody = {
  name: "Stadtpark Spielplatz",
  location: "Stadtpark 1, Essen",
  latitude: 51.45,
  longitude: 7.01,
};

describe("Playground endpoints (integration)", () => {
  beforeEach(() => {
    // 預設是「沒登入」，需要登入的測試再自己覆蓋
    getAuth.mockReturnValue({ userId: null });
  });

  test("GET /api/playgrounds returns the list", async () => {
    const fake = [{ _id: "1", name: "Test Playground" }];
    Playground.find.mockResolvedValue(fake);

    const res = await request(app).get("/api/playgrounds").expect(200);

    expect(res.body).toEqual({ success: true, data: fake });
  });

  test("GET /api/playgrounds/:id returns 404 when not found", async () => {
    Playground.findById.mockResolvedValue(null);

    const res = await request(app).get("/api/playgrounds/abc123").expect(404);

    expect(res.body).toEqual({ success: false, error: "Playground not found" });
  });

  test("POST /api/playgrounds returns 401 when not logged in", async () => {
    const res = await request(app)
      .post("/api/playgrounds")
      .send(validBody)
      .expect(401);

    expect(res.body).toEqual({ success: false, error: "Please login" });
    expect(Playground.create).not.toHaveBeenCalled();
  });

  test("POST /api/playgrounds returns 400 when latitude is not a number", async () => {
    getAuth.mockReturnValue({ userId: "user-abc" });

    const res = await request(app)
      .post("/api/playgrounds")
      .send({ ...validBody, latitude: "abc" })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(Playground.create).not.toHaveBeenCalled();
  });

  test("POST /api/playgrounds creates with the logged-in user as owner", async () => {
    getAuth.mockReturnValue({ userId: "user-abc" });
    Playground.create.mockResolvedValue({
      _id: "new1",
      ...validBody,
      ownerId: "user-abc",
    });

    // 故意在 body 塞一個假的 ownerId，就像你昨天在 Postman 測的那樣
    const res = await request(app)
      .post("/api/playgrounds")
      .send({ ...validBody, ownerId: "hacker-999" })
      .expect(201);

    expect(Playground.create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: "user-abc" }),
    );
    expect(res.body.data.ownerId).toBe("user-abc");
  });
});

/* ---------------------------- PATCH 的 ownership --------------------------- */
/* ---------------------------- PATCH 的 ownership --------------------------- */
/* ---------------------------- PATCH 的 ownership --------------------------- */
describe("PATCH /api/playgrounds/:id (ownership)", () => {
  beforeEach(() => {
    getAuth.mockReturnValue({ userId: null });
  });

  test("returns 403 and does not save when the user is not the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-not-owner" });
    const fake = { ownerId: "user-real-owner", save: jest.fn() };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app)
      .patch("/api/playgrounds/p1")
      .send({ name: "Hacked Name" })
      .expect(403);

    expect(res.body).toEqual({
      success: false,
      error: "Not allowed to edit this playground",
    });
    expect(fake.save).not.toHaveBeenCalled();
  });

  test("returns 200 and saves when the user is the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = {
      ownerId: "user-real-owner",
      name: "Old Name",
      save: jest.fn().mockResolvedValue(true),
    };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app)
      .patch("/api/playgrounds/p1")
      .send({ name: "New Name" })
      .expect(200);

    expect(fake.save).toHaveBeenCalled();
    expect(res.body.data.name).toBe("New Name");
  });

  test("does not let the owner change ownerId through the body", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = {
      ownerId: "user-real-owner",
      name: "Old Name",
      save: jest.fn().mockResolvedValue(true),
    };
    Playground.findById.mockResolvedValue(fake);

    await request(app)
      .patch("/api/playgrounds/p1")
      .send({ name: "New Name", ownerId: "someone-else" })
      .expect(200);

    expect(fake.ownerId).toBe("user-real-owner");
  });
});
/* --------------------------- DELETE 的 ownership --------------------------- */
/* --------------------------- DELETE 的 ownership --------------------------- */
/* --------------------------- DELETE 的 ownership --------------------------- */
describe("DELETE /api/playgrounds/:id (ownership)", () => {
  beforeEach(() => {
    getAuth.mockReturnValue({ userId: null });
  });

  test("returns 403 and does not delete when the user is not the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-not-owner" });
    const fake = { ownerId: "user-real-owner", deleteOne: jest.fn() };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app).delete("/api/playgrounds/p1").expect(403);

    expect(res.body).toEqual({
      success: false,
      error: "Not allowed to delete this playground",
    });
    expect(fake.deleteOne).not.toHaveBeenCalled();
  });

  test("returns 200 and deletes when the user is the owner", async () => {
    getAuth.mockReturnValue({ userId: "user-real-owner" });
    const fake = {
      ownerId: "user-real-owner",
      deleteOne: jest.fn().mockResolvedValue(true),
    };
    Playground.findById.mockResolvedValue(fake);

    const res = await request(app).delete("/api/playgrounds/p1").expect(200);

    expect(fake.deleteOne).toHaveBeenCalled();
    expect(res.body).toEqual({ success: true, data: null });
  });
});
